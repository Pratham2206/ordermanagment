// const nodemailer = require('nodemailer');
// require('dotenv').config({ path: './backend/.env' });

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// // Send OTP Email
// const sendOtpEmail = async (email, otp) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: 'Your OTP Code',
//         text: `Your OTP code is: ${otp}`,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`OTP sent to ${email}`);
//     } catch (error) {
//         console.error(`Failed to send OTP to ${email}: ${error.message}`);
//         throw new Error('Failed to send OTP email. Please try again later.');
//     }
// };

// // Send Password Reset Email
// const sendPasswordResetEmail = async (email, resetLink) => {
//     const mailOptions = { 
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: 'Password Reset Request',
//         text: `Click the following link to reset your password: ${resetLink}`,
//         html: `<p>Click the following link to reset your password:</p> 
//                <a href="${resetLink}">Reset Password</a>`,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('Password reset email sent successfully.');
//     } catch (error) {
//         console.error('Error sending password reset email:', error);
//         throw error;
//     }
// };

// // Send Career Application Email
// const sendCareerEmail = async (recipientEmail, username, profile, resumeFilename, resumeData) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: recipientEmail,
//         subject: 'Career Application Submitted',
//         text: `Dear ${username},\n\nYour application for ${profile} has been submitted successfully.\n\nResume Filename: ${resumeFilename}`,
//         attachments: [
//             {
//                 filename: resumeFilename,
//                 content: resumeData,
//             },
//         ],
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`Career application email sent to ${recipientEmail}`);
//     } catch (error) {
//         console.error(`Failed to send career application email to ${recipientEmail}: ${error.message}`);
//         throw new Error('Failed to send career application email. Please try again later.');
//     }
// };

// // Send Contact Query Email
// const sendQueryContactEmail = async (recipientEmail, username, queries) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: recipientEmail,
//         subject: 'Contact Query Received',
//         text: `Dear ${username},\n\nThank you for your query. We will get back to you shortly.\n\nYour Query: ${queries}`,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`Contact query email sent to ${recipientEmail}`);
//     } catch (error) {
//         console.error(`Failed to send contact query email to ${recipientEmail}: ${error.message}`);
//         throw new Error('Failed to send contact query email. Please try again later.');
//     }
// };

// module.exports = { 
//     sendOtpEmail,
//     sendPasswordResetEmail,
//     sendCareerEmail,
//     sendQueryContactEmail 
// };


// require('dotenv').config({ path: './backend/.env' });
// const nodemailer = require('nodemailer');

// // Create a transporter object using SMTP transport
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS, // Ensure this is the correct app-specific password
//     },
// });

// // General email sending function
// const sendEmail = async (to, subject, htmlContent) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to,
//         subject,
//         html: htmlContent,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`Email sent to ${to}`);
//     } catch (error) {
//         console.error(`Error sending email to ${to}:`, error);
//         throw new Error('Failed to send email. Please try again later.');
//     }
// };

// // Send OTP Email
// const sendOtpEmail = async (email, otp) => {
//     const htmlContent = `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
//             <h2 style="color: #333;">Your OTP Code</h2>
//             <p style="font-size: 16px;">Your OTP code is:</p>
//             <h1 style="font-size: 36px; color: #007bff;">${otp}</h1>
//             <p style="color: #555;">Please enter this code to proceed.</p>
//         </div>
//     `;
//     await sendEmail(email, 'Your OTP Code', htmlContent);
// };

// // Send Password Reset Email
// const sendPasswordResetEmail = async (email, resetLink) => {
//     const htmlContent = `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
//             <h2 style="color: #333;">Password Reset Request</h2>
//             <p style="font-size: 16px;">Click the following link to reset your password:</p>
//             <a href="${resetLink}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
//         </div>
//     `;
//     await sendEmail(email, 'Password Reset Request', htmlContent);
// };

// // Send Career Application Email
// const sendCareerEmail = async (recipientEmail, username, profile, resumeFilename, resumeData) => {
//     const htmlContent = `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
//             <h2 style="color: #333;">Career Application Submitted</h2>
//             <p>Dear ${username},</p>
//             <p>Your application for <strong>${profile}</strong> has been submitted successfully.</p>
//             <p><strong>Resume Filename:</strong> ${resumeFilename}</p>
//             <p>Thank you for your interest!</p>
//         </div>
//     `;
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: recipientEmail,
//         subject: 'Career Application Submitted',
//         html: htmlContent,
//         attachments: [
//             {
//                 filename: resumeFilename,
//                 content: resumeData,
//                 contentType: 'application/pdf' // Adjust this as needed
//             }
//         ]
//     };
//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`Email sent to ${recipientEmail}`);
//     } catch (error) {
//         console.error(`Error sending email to ${recipientEmail}:`, error);
//         throw new Error('Failed to send email. Please try again later.');
//     }
// };

// // Send Contact Query Email
// const sendQueryContactEmail = async (recipientEmail, username, queries) => {
//     const htmlContent = `
//         <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
//             <h2 style="color: #333;">Contact Query Received</h2>
//             <p>Dear ${username},</p>
//             <p>Thank you for your query. We will get back to you shortly.</p>
//             <p><strong>Your Query:</strong></p>
//             <p style="color: #555;">${queries}</p>
//         </div>
//     `;
//     await sendEmail(recipientEmail, 'Contact Query Received', htmlContent);
// };

// module.exports = { 
//     sendOtpEmail,
//     sendPasswordResetEmail,
//     sendCareerEmail,
//     sendQueryContactEmail 
// };

// require('dotenv').config({ path: './backend/.env' });
require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Ensure this is the correct app-specific password
    },
});


// Function to create the HTML structure with header and footer
const createEmailTemplate = (content) => {
    return `
        <div style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
            <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Welcome to TURTU</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
                ${content}
            </div>
            <div style="background-color: #f1f1f1; color: #555; padding: 10px; text-align: center;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} TURTU. All rights reserved.</p>
            </div>
        </div>
    `;
};

// General email sending function
const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: `"TURTU Services" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        throw new Error('Failed to send email. Please try again later.');
    }
};

// Send OTP Email
const sendOtpEmail = async (email, otp) => {
    const content = `
        <h2 style="color: #333;">Your OTP Code</h2>
        <p style="font-size: 16px;">Your OTP code is:</p>
        <h1 style="font-size: 36px; color: #007bff;">${otp}</h1>
        <p style="color: #555;">Please enter this code to proceed.</p>
    `;
    await sendEmail(email, 'Your OTP Code', createEmailTemplate(content));
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, resetLink) => {
    const content = `
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="font-size: 16px;">Click the following link to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
    `;
    await sendEmail(email, 'Password Reset Request', createEmailTemplate(content));
};

// Send Career Application Email
const sendCareerEmail = async (recipientEmail, username, profile, resumeFilename, resumeData) => {
    const content = `
        <h2 style="color: #333;">Career Application Submitted</h2>
        <p>Dear ${username},</p>
        <p>Your application for <strong>${profile}</strong> has been submitted successfully.</p>
        <p><strong>Resume Filename:</strong> ${resumeFilename}</p>
        <p>Thank you for your interest!</p>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: 'Career Application Submitted',
        html: createEmailTemplate(content),
        attachments: [
            {
                filename: resumeFilename,
                content: resumeData,
                contentType: 'application/pdf' // Adjust this as needed
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipientEmail}`);
    } catch (error) {
        console.error(`Error sending email to ${recipientEmail}:`, error);
        throw new Error('Failed to send email. Please try again later.');
    }
};

// Send Contact Query Email
const sendQueryContactEmail = async (recipientEmail, username, queries) => {
    const content = `
        <h2 style="color: #333;">Contact Query Received</h2>
        <p>Dear ${username},</p>
        <p>Thank you for your query. We will get back to you shortly.</p>
        <p><strong>Your Query:</strong></p>
        <p style="color: #555;">${queries}</p>
    `;
    await sendEmail(recipientEmail, 'Contact Query Received', createEmailTemplate(content));
};

module.exports = { 
    sendOtpEmail,
    sendPasswordResetEmail,
    sendCareerEmail,
    sendQueryContactEmail 
};
