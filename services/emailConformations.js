require('dotenv').config();
// require('dotenv').config({ path: './backend/.env' });
const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Ensure this is the correct app-specific password
  },
});



const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"TURTU" <${process.env.EMAIL_USER}>`, 
    to,
    subject,
    html: htmlContent, // Use 'html' instead of 'text' for HTML emails
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`); // Uncomment for debugging
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

// const createEmailTemplate = (title, bodyContent) => `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f8f9fa;
//             margin: 0;
//             padding: 20px;
//         }
//         .container {
//             max-width: 600px;
//             margin: auto;
//             background: #ffffff;
//             border-radius: 8px;
//             box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//             padding: 20px;
//         }
//         .header {
//             background-color: #007bff;
//             color: white;
//             padding: 10px;
//             text-align: center;
//             border-radius: 8px 8px 0 0;
//         }
//         .footer {
//             text-align: center;
//             margin-top: 20px;
//             font-size: 12px;
//             color: #666;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <h1>${title}</h1>
//         </div>
//         <div class="body">
//             <p>${bodyContent}</p>
//         </div>
//         <div class="footer">
//             <p>Best regards,<br>The TURTU Team</p>
//         </div>
//     </div>
// </body>
// </html>
// `;

const createEmailTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .body {
            padding: 20px;
            color: #333333;
        }
        .body p {
            margin: 0 0 15px;
        }
        .footer {
            background-color: #f1f1f1;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e1e1e1;
        }
        @media (max-width: 600px) {
            .container {
                width: 90%;
                margin: 20px auto;
            }
            .header h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        <div class="body">
            <p>${bodyContent}</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The TURTU Team</p>
        </div>
    </div>
</body>
</html>
`;


module.exports = { sendEmail, createEmailTemplate };




