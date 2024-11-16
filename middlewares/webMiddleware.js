require('dotenv').config();
const jwt = require('jsonwebtoken');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET; // Ensure you have this defined in your .env file

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        console.error('Token verification error:', err);
        throw err; // Rethrow error for middleware handling
    }
};
exports.tokenRequired = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Token is missing!' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded; 
        const userId = req.user.user_id; 
        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'User ID is missing from token.' });
        }
        next(); 
    } catch (error) {
        console.error('Error in tokenRequired middleware:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: 'error', message: 'Token has expired. Please log in again.' });
        }
        return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
    }
};
exports.allowedFile = (filename) => {
    return ['.pdf', '.doc', '.docx'].includes(path.extname(filename).toLowerCase());
};
