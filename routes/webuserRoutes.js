// routes/user.js
const express = require('express');
const { tokenRequired } = require('../middlewares/webMiddleware');
const webuserController = require('../controllers/webuserController');
const router = express.Router();

// Verify token
router.get('/verify', tokenRequired, (req, res) => {
    return res.json({
        message: 'Token is valid!',
        user: req.user // user info from middleware
    });
});

// Career application
router.post('/career', tokenRequired, webuserController.careerApplication);

// Get career applications
router.get('/career-applications', webuserController.getCareerApplications);

// Download resume
router.get('/career-applications/:applicationId/resume', webuserController.downloadResume);

// Contact submission
router.post('/contact', webuserController.contact);

// Get contact queries
router.get('/contact-queries', webuserController.getContactQueries);

module.exports = router;
