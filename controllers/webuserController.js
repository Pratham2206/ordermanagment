const Contact = require('../models/contact');
require('dotenv').config();
const CareerApplication = require('../models/careerApplication');
const { sendCareerEmail, sendQueryContactEmail } = require('../services/webemails');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // Set limit to 5 MB
const { tokenRequired, allowedFile } = require('../middlewares/webMiddleware'); // Import your middleware

// Career application
exports.careerApplication = [
    tokenRequired,
    upload.single('resume'), // Middleware to handle the single file upload with the field name 'resume'
    async (req, res) => {
        const { email, phone_number, profile } = req.body; // Extract form data
        const resume = req.file; // Extract the uploaded file

        // Check for required fields
        if (!email || !phone_number || !profile || !resume) {
            return res.status(400).json({ status: 'error', message: 'All fields are required.' });
        }

        // Check if the file type is allowed
        if (!allowedFile(resume.originalname)) {
            return res.status(400).json({ status: 'error', message: 'Invalid file format for resume.' });
        }

        // Check for file size (this is already handled by multer, but you can check here too)
        if (resume.size > 5 * 1024 * 1024) {
            return res.status(400).json({ status: 'error', message: 'Resume file is too large. Max size is 5MB.' });
        }

        try {
            const userId = req.user.user_id;  // Change this line to access user_id instead of id
            console.log("User ID from token:", userId);  // Log user ID to verify it

            if (!userId) {
                return res.status(400).json({ status: 'error', message: 'User ID is missing from token.' });
            }

            const resumeData = resume.buffer; // Resume binary data

            // Save to database
            const application = await CareerApplication.create({
                user_id: userId,
                email,
                phone_number,
                profile,
                resume_filename: resume.originalname,
                resume_data: resumeData
            });
            
            // Send email notification
            await sendCareerEmail(email, req.user.username, profile, resume.originalname, resumeData);

            return res.status(201).json({ status: 'success', message: 'Application submitted successfully!' });
        } catch (error) {
            console.error('Error occurred:', error);
            return res.status(500).json({ status: 'error', message: 'An error occurred while saving your application.' });
        }
    }
];

// Get all career applications
exports.getCareerApplications = async (req, res) => {
    try {
        const applications = await CareerApplication.findAll();
        return res.json({ status: 'success', data: applications });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ status: 'error', message: 'An error occurred while fetching applications.' });
    }
};

// Download resume as PDF only
exports.downloadResume = async (req, res) => {
    const { applicationId } = req.params;

    try {
        const application = await CareerApplication.findByPk(applicationId);
        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found.' });
        }

        const resumeData = application.resume_data;
        const resumeFilename = `${application.resume_filename.split('.').slice(0, -1).join('.')}.pdf`; // Force PDF extension

        // Set the response headers to indicate PDF content type and force download as PDF
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `inline; filename="${resumeFilename}"`);

        return res.send(resumeData);
    } catch (error) {
        console.error('Error downloading resume:', error);
        return res.status(500).json({ status: 'error', message: 'An error occurred while downloading the resume.' });
    }
};

exports.downloadResume = async (req, res) => {
    const { applicationId } = req.params;
    const { download } = req.query;  // Check if the 'download' query parameter is present

    try {
        const application = await CareerApplication.findByPk(applicationId);
        if (!application) {
            return res.status(404).json({ status: 'error', message: 'Application not found.' });
        }

        const resumeData = application.resume_data;
        const resumeFilename = `${application.resume_filename.split('.').slice(0, -1).join('.')}.pdf`; // Force PDF extension

        // Set the response headers to indicate PDF content type
        res.set('Content-Type', 'application/pdf');

        if (download === 'true') {
            // If 'download=true' is passed, force the download
            res.set('Content-Disposition', `attachment; filename="${resumeFilename}"`);
        } else {
            // Otherwise, just display the PDF in the browser
            res.set('Content-Disposition', `inline; filename="${resumeFilename}"`);
        }

        // Send the resume data (PDF) to the client
        return res.send(resumeData);
    } catch (error) {
        console.error('Error downloading/viewing resume:', error);
        return res.status(500).json({ status: 'error', message: 'An error occurred while downloading/viewing the resume.' });
    }
};


// Contact submission
exports.contact = async (req, res) => {
    const { username, email, phone_number, queries } = req.body;

    if (!username || !email || !phone_number || !queries) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    try {
        const contactEntry = await Contact.create({ username, email, phone_number, queries });
        await sendQueryContactEmail(email, username, queries);
        
        return res.status(201).json({ 
            status: 'success', 
            message: 'Your message has been sent!' 
        });
    } catch (error) {
        console.error('Error during contact creation:', error);
        return res.status(500).json({ status: 'error', message: 'An error occurred while creating contact.' });
    }
};

// Get contact queries
exports.getContactQueries = async (req, res) => {
    try {
        const contacts = await Contact.findAll();
        return res.json({ status: 'success', data: contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return res.status(500).json({ status: 'error', message: 'An error occurred while fetching contacts.' });
    }
};
