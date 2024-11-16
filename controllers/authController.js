require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const Employee = require('../models/employee');
const Token = require('../models/token'); 
const { sendEmail, createEmailTemplate} = require('../services/emailConformations'); // Adjust the path as needed

// Constants
const OTP_EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
const OTP_RESEND_TIME = 3 * 60 * 1000; // 3 minutes in milliseconds
const JWT_EXPIRATION = '1hr';


// Utility functions
const generateToken = (payload) => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT secret is not defined');
  }
  return jwt.sign(payload, secretKey, { expiresIn: JWT_EXPIRATION });
};

// Controller functions
const registerUser = async (req, res) => {
  const { name, email, phonenumber, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = crypto.randomInt(100000, 999999);
  const otpExpires = new Date(Date.now() + OTP_EXPIRATION_TIME);

  const newUser = await Employee.create({
    name,
    email,
    password: hashedPassword,
    role,
    phonenumber,
    otp,
    otpExpires,
  });

  const otpMessage = createEmailTemplate(
    'Your OTP Code',
    `Dear ${name},<br><br>
    Your OTP code is : <strong style="font-size: 24px; color: #007bff;">${otp}</strong>
.<br> Please use this code to verify your account.`
);
await sendEmail(email, 'Your OTP Code', otpMessage);
  res.status(201).json({
    user: {
      id: newUser.id,
      name,
      email,
      role,
      phonenumber,
    },
  });
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await Employee.findOne({ where: { email } });

  if (user && user.otp === otp && new Date() < user.otpExpires) {
    await user.update({ otp: null, otpExpires: null, isVerified: true });
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ error: 'Invalid or expired OTP' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASS;

  if (email === adminEmail && password === adminPassword) {
    const token = generateToken({ email: adminEmail, role: 'admin' });
    return res.json({
      token,
      user: {
        id: '001',
        name: 'Admin',
        email: adminEmail,
        role: 'admin',
        isApproved: true,
      },
    });
  }

  const user = await Employee.findOne({ where: { email } });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      phonenumber: user.phonenumber,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        phonenumber: user.phonenumber,
      },
    });
  }
  res.status(400).json({ error: 'Invalid credentials / wait for admin approval' });
};

const logoutUser = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const userId = req.user.id;

  if (token) {
    const tokenRecord = await Token.findOne({ where: { token } });

    if (!tokenRecord) {
      await Token.create({
        token,
        userId: userId,
        expiresAt: new Date(Date.now() + 3600000),
        isBlacklisted: true,
      });

      return res.json({ message: 'Logged out and token blacklisted successfully' });
    }

    return res.json({ message: 'Token already blacklisted' });
  } else {
    return res.status(400).json({ error: 'Token not provided' });
  }
};

const deleteUnverifiedUsers = async () => {
  const now = new Date();
  const expiredUsers = await Employee.findAll({
    where: {
      isVerified: false,
      createdAt: { [Op.lt]: new Date(now - OTP_RESEND_TIME) },
    },
    limit: 100,
  });

  if (expiredUsers.length > 0) {
    await Promise.all(expiredUsers.map(user => user.destroy()));
    console.log(`Deleted ${expiredUsers.length} unverified users`);
  }
};

const cleanupAllBlacklistedTokens = async () => {
  try {
    const result = await Token.destroy({
      where: {
        isBlacklisted: 1,
      },
    });

    console.log(`Deleted ${result} blacklisted tokens`);
  } catch (err) {
    console.error('Error cleaning up blacklisted tokens:', err);
  }
};

setInterval(deleteUnverifiedUsers, OTP_RESEND_TIME);
setInterval(cleanupAllBlacklistedTokens, 3600 * 1000);

module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  logoutUser,
};
