require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// require('dotenv').config({ path: './backend/.env' });
const moment = require('moment-timezone');
const randomize = require('randomatic');
const {sendOtpEmail, sendPasswordResetEmail } = require('../services/webemails');
const User = require('../models/user');
const { Op } = require('sequelize');


const JWT_SECRET = process.env.JWT_SECRET; // Ensure you have this in your config file

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=!]).{8,}$/;
    return passwordRegex.test(password);
};

// Register new user
exports.register = async (req, res) => {
    const { username, email, phone_number, password, confirm_password } = req.body;

    if (!validatePassword(password)) {
        return res.status(400).json({ status: 'error', message: 'Password does not meet the requirements.' });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ status: 'error', message: 'Passwords do not match.' });
    }

    try {
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phone_number }],
            },
        });

        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'Email or phone number already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = randomize('0', 6); // Generate a 6-digit OTP
        const otpExpiry = moment().add(10, 'minutes').toDate();

        const role = 'user';

        const newUser = await User.create({
            username,
            email,
            phone_number,
            password: hashedPassword,
            otp,
            otp_expiry: otpExpiry,
            is_verified: false,
            registration_date: new Date(),
            role,
        });

        await sendOtpEmail(email, otp);

        res.status(201).json({ status: 'success', message: 'User registered successfully! Check your email for the OTP.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error.' });
    }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found.' });
        }

        const otpExpiry = moment(user.otp_expiry).toDate();
        if (moment().isBefore(otpExpiry)) {
            return res.status(400).json({ status: 'error', message: 'OTP is still valid. Please check your email.' });
        }

        const newOtp = randomize('0', 6);
        const newOtpExpiry = moment().add(10, 'minutes').toDate();

        user.otp = newOtp;
        user.otp_expiry = newOtpExpiry;
        await user.save(); // Update user with new OTP

        await sendOtpEmail(email, newOtp);

        res.status(200).json({ status: 'success', message: 'New OTP has been sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error.' });
    }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ status: 'error', message: 'Invalid OTP.' });
        }

        if (moment().isAfter(user.otp_expiry)) {
            return res.status(400).json({ status: 'error', message: 'OTP has expired.' });
        }

        user.is_verified = true; // Mark user as verified
        user.otp = null; // Clear OTP
        user.otp_expiry = null; // Clear OTP expiry
        await user.save(); // Update user

        res.status(200).json({ status: 'success', message: 'User has been successfully verified.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error.' });
    }
};

// User/Admin Login (Hardcoded admin email and password)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Hardcoded admin credentials
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    try {
        // Check if it's the admin logging in
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const adminToken = jwt.sign(
                { role: 'admin', email: ADMIN_EMAIL, username: 'Admin' },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                status: 'success',
                message: 'Admin login successful!',
                data: {
                    username: 'Admin',
                    email: ADMIN_EMAIL,
                    token: adminToken,
                },
            });
        }

        // For regular users
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ status: 'error', message: 'Email not verified. Please verify your email.' });
        }

        const token = jwt.sign(
            { user_id: user.id, email: user.email, username: user.username, phone_number: user.phone_number },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            status: 'success',
            message: 'Login successful!',
            data: {
                user_id: user.id,
                username: user.username,
                email: user.email,
                phone_number: user.phone_number, // Added phone_number
                token,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error.' });
    }
};


// Request password reset
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Please provide an email address.' });
    }
  
    try {
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'Email not found.' });
      }
  
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '30m' });
  
      // clientURL will be dynamically assigned based on NODE_ENV
      const clientURL = process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL_PROD : process.env.CLIENT_URL_LOCAL;
      console.log(`Client URL determined: ${clientURL}`);
      
      const resetLink = `${clientURL}/reset-password/${token}`;  // Generates the correct reset link
      await sendPasswordResetEmail(email, resetLink);
  
      res.status(200).json({ status: 'success', message: 'A password reset link has been sent to your email.' });
    } catch (error) {
      console.error('Error in requestPasswordReset:', error);
      res.status(500).json({ status: 'error', message: 'Server error.' });
    }
  };

  
// Reset password
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirm_password } = req.body;

    if (!password || !confirm_password) {
        return res.status(400).json({ status: 'error', message: 'Both password fields are required.' });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ status: 'error', message: 'Passwords do not match.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const email = decoded.email;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found.' });
        }

        user.password = hashedPassword;
        await user.save(); // Update password

        res.status(200).json({ status: 'success', message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Invalid or expired token.' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;
    const userId = req.user.id; // Assuming you have middleware to set req.user

    if (new_password !== confirm_password) {
        return res.status(400).json({ status: 'error', message: 'Passwords do not match.' });
    }

    try {
        const user = await User.findByPk(userId);

        if (!user || !(await bcrypt.compare(current_password, user.password))) {
            return res.status(401).json({ status: 'error', message: 'Invalid current password.' });
        }

        user.password = await bcrypt.hash(new_password, 10);
        await user.save(); // Update password

        res.status(200).json({ status: 'success', message: 'Password changed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Server error.' });
    }
};
