// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config({ path: './backend/.env' });
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// const { Op } = require('sequelize');
// const User = require('../models/user');
// const DeliveryBoy = require('../models/deliveryBoy');
// const Token = require('../models/token'); 
// const checkTokenBlacklist = require('../middlewares/tokenMiddleware');

// // Constants
// const OTP_EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
// const OTP_RESEND_TIME = 3 * 60 * 1000; // 3 minutes in milliseconds
// const JWT_EXPIRATION = '1hr';

// // Create a nodemailer transporter instance
// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Utility functions
// const sendEmail = async (to, subject, text) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     text,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const generateToken = (payload) => {
//   const secretKey = process.env.JWT_SECRET;
//  // Make sure this is defined
//   if (!secretKey) {
//     throw new Error('JWT secret is not defined'); // Optional: Add a check to help debugging
//   }
//   return jwt.sign(payload, secretKey, { expiresIn: JWT_EXPIRATION });
// };
// // Registration route (no token generation here)
// router.post('/register', async (req, res) => {
//   const { name, email, phonenumber, password, role } = req.body;

//   // Hash password
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const otp = crypto.randomInt(100000, 999999); // Generate a 6-digit OTP
//   const otpExpires = new Date(Date.now() + OTP_EXPIRATION_TIME); // OTP valid for 15 minutes

//   // Create new user
//   const newUser = await User.create({
//     name,
//     email,
//     password: hashedPassword,
//     role,
//     phonenumber,
//     otp,
//     otpExpires,
//   });

//   // Send OTP email
//   await sendEmail(email, 'Your OTP Code', `Your OTP code is ${otp}`);

//   // Respond with user info (no token)
//   res.status(201).json({
//     user: {
//       id: newUser.id,
//       name,
//       email,
//       role,
//       phonenumber,
//     },
//   });
// });

// // Verify OTP route (no changes)
// router.post('/verify-otp', async (req, res) => {
//   const { email, otp } = req.body;
//   const user = await User.findOne({ where: { email } });

//   if (user && user.otp === otp && new Date() < user.otpExpires) {
//     await user.update({ otp: null, otpExpires: null, isVerified: true });

//     if (user.role === 'delivery boy') {
//       await DeliveryBoy.create({
//         name: user.name,
//         email: user.email,
//         password: user.password,
//         phonenumber: user.phonenumber,
//         role: user.role,
//         created_at: new Date(),
//         user_id: user.id,
//       });
//     }

//     res.status(200).json({ message: 'OTP verified successfully' });
//   } else {
//     res.status(400).json({ error: 'Invalid or expired OTP' });
//   }
// });

// // Login route
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   const adminEmail = process.env.ADMIN_USER;
//   const adminPassword = process.env.ADMIN_PASS;

//   // Admin login
//   if (email === adminEmail && password === adminPassword) {
//     const token = generateToken({ email: adminEmail, role: 'admin' });
//     return res.json({
//       token,
//       user: {
//         id: '001',
//         name: 'Admin',
//         email: adminEmail,
//         role: 'admin',
//         isApproved: true,
//       },
//     });
//   }

//   // Regular user login
//   const user = await User.findOne({ where: { email } });
//   if (user && await bcrypt.compare(password, user.password)) {
//     const token = generateToken({
//       id: user.id,
//       email: user.email,
//       role: user.role,
//       phonenumber: user.phonenumber,
//     });

//     return res.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isApproved: user.isApproved,
//         phonenumber: user.phonenumber,
//       },
//     });
//   }
//   res.status(400).json({ error: 'Invalid credentials / wait for admin approval' });
// }); 
// // Logout route (blacklist the token)
// router.post('/logout', checkTokenBlacklist,async (req, res) => {
//   const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header
//   const userId = req.user.id; // Extract userId from the verified token

//   if (token) {
//       const tokenRecord = await Token.findOne({ where: { token } });

//       if (!tokenRecord) {
//           // Save the blacklisted token
//           await Token.create({
//               token,
//               userId: userId, // Use the userId from the request
//               expiresAt: new Date(Date.now() + 3600000), // Set expiration time
//               isBlacklisted: true,
//           });

//           return res.json({ message: 'Logged out and token blacklisted successfully' });
//       }

//       return res.json({ message: 'Token already blacklisted' });
//   } else {
//       return res.status(400).json({ error: 'Token not provided' });
//   }
// });

// // Delete unverified users task (unchanged)
// const deleteUnverifiedUsers = async () => {
//   const now = new Date();
//   const expiredUsers = await User.findAll({
//     where: {
//       isVerified: false,
//       createdAt: { [Op.lt]: new Date(now - OTP_RESEND_TIME) },
//     },
//     limit: 100,
//   });

//   if (expiredUsers.length > 0) {
//     await Promise.all(expiredUsers.map(user => user.destroy()));
//     console.log(`Deleted ${expiredUsers.length} unverified users`);
//   }
// };

// // Schedule task every 3 minutes (unchanged)
// setInterval(deleteUnverifiedUsers, OTP_RESEND_TIME);


// // Cleanup function to delete all blacklisted tokens without checking expiration
// const cleanupAllBlacklistedTokens = async () => {
//   try {
//     // Find and delete all blacklisted tokens
//     const result = await Token.destroy({
//       where: {
//         isBlacklisted: 1, // Only delete blacklisted tokens
//       },
//     });

//     console.log(`Deleted ${result} blacklisted tokens`);
//   } catch (err) {
//     console.error('Error cleaning up blacklisted tokens:', err);
//   }
// };

// setInterval(cleanupAllBlacklistedTokens, 3600 * 1000);
// module.exports = router;

const express = require('express');
const router = express.Router();
const checkTokenBlacklist = require('../middlewares/tokenMiddleware');
const authController= require('../controllers/authController');


// Routes
router.post('/register',authController.registerUser);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.loginUser);
router.post('/logout', checkTokenBlacklist,authController.logoutUser);

module.exports = router;
