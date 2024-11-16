// const express = require('express');
// require('dotenv').config({ path: './backend/.env' });
// const router = express.Router();
// const Order = require('../models/order');
// const Customer = require('../models/customer');
// const Razorpay = require("razorpay");
// const crypto = require('crypto');

// router.post('/submit', async (req, res) => {
//     const {
//         serviceType, // "Delivery Now" or "Schedule for Later"
//         name,
//         phoneNumber,
//         email,
//         weight,
//         pickupAddress,
//         dropAddress,
//         content,
//         deliveryInstructions, // optional
//         receiverPhonenumber,
//         receiverName,
//         pickupDate, // only for 'Schedule for Later'
//         pickupTime  // only for 'Schedule for Later'
//     } = req.body;

//     try {
//         // Check if the customer already exists by email or phone number
//         let customer = await Customer.findOne({ where: { email } });
//         if (!customer) {
//             customer = await Customer.create({
//                 name,
//                 phoneNumber,
//                 email,
//                 pickupAddress, // Assuming this is customer-specific
//                 dropAddress,   // Assuming this is customer-specific
//                 receiverPhonenumber, // Assuming this is customer-specific
//                 receiverName,
//                 content,
//                 weight,
//             });
//         }

//         // Handle immediate delivery (Delivery Now)
//         if (serviceType === "Delivery Now") {
//             await Order.create({
//                 phoneNumber,
//                 name,
//                 email,
//                 weight,
//                 pickupAddress,
//                 dropAddress,
//                 content,
//                 deliveryInstructions,
//                 receiverPhonenumber,
//                 receiverName,
//                 status: 'pending', // Default status
//             });
//             res.status(200).send('Immediate delivery order created successfully');
//         }
//         // Handle scheduled delivery (Schedule for Later)
//         else if (serviceType === "Schedule for Later") {
//             if (!pickupDate || !pickupTime) {
//                 return res.status(400).send('Pickup date and time are required for scheduled deliveries');
//             }

//             await Order.create({
//                 customerId: customer.id,  // Associate customer with order
//                 phoneNumber,
//                 name,
//                 email,
//                 weight,
//                 pickupAddress,
//                 dropAddress,
//                 content,
//                 deliveryInstructions,
//                 receiverPhonenumber,
//                 receiverName,
//                 pickupDate,  // Schedule pickup date
//                 pickupTime,  // Schedule pickup time
//                 status: 'pending', // Default status
//             });
//             res.status(200).send('Scheduled delivery order created successfully');
//         } else {
//             res.status(400).send('Invalid service type');
//         }
//     } catch (err) {
//         console.error('Error processing order:', err);
//         res.status(500).send('Error creating the order');
//     }
// });

// // Razorpay initialization
// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// });
// // Route to create a Razorpay order
// router.post('/create-razorpay-order', async (req, res) => {
//     try {
//         const { amount, currency, receipt } = req.body; // amount should be in paise
//         if (!amount || !currency) {
//             return res.status(400).json({ error: 'Amount and currency are required' });
//         }
//         const options = {
//             amount: amount,
//             currency: currency,
//             receipt: receipt || `receipt#${Date.now()}`, // Generate a unique receipt if not provided
//         };
//         const razorpayOrder = await razorpay.orders.create(options);
//         res.json(razorpayOrder); // Send the created order back as a response
//     } catch (error) {
//         console.error('Error creating Razorpay order:', error.response ? error.response.data : error.message);
//         res.status(500).json({ error: 'Internal Server Error', message: error.message });
//     }
// });

// router.post('/usersubmit', async (req, res) => {
//     const {
//         serviceType,
//         name,
//         phoneNumber,
//         email,
//         weight,
//         pickupAddress,
//         dropAddress,
//         content,
//         deliveryInstructions,
//         receiverPhonenumber,
//         receiverName,
//         pickupDate,
//         pickupTime,
//         razorpay_payment_id,
//         razorpay_order_id,
//         razorpay_signature,
//         amount,
//     } = req.body;
//     try {
//         // Step 1: Verify the payment signature
//         const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//         shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//         const digest = shasum.digest('hex');
//         if (digest !== razorpay_signature) {
//             return res.status(400).json({ status: 'failed' }); // Return early if verification fails
//         }
//         // Step 2: Proceed to create the order if payment is successful
//         let customer = await Customer.findOne({ where: { email } });
//         if (!customer) {
//             customer = await Customer.create({
//                 name,
//                 phoneNumber,
//                 email,
//                 pickupAddress,
//                 dropAddress,
//                 receiverPhonenumber,
//                 receiverName,
//                 content,
//                 weight,
//             });
//         }
//         const amountInRupees = (amount / 100).toFixed(2); // Convert paise to rupees
//         const orderData = {
//             customerId: serviceType === "Delivery Now" ? null : customer.id,
//             phoneNumber,
//             name,
//             email,
//             weight,
//             pickupAddress,
//             dropAddress,
//             content,
//             deliveryInstructions,
//             receiverPhonenumber,
//             receiverName,
//             razorpay_payment_id,
//             razorpay_order_id,
//             razorpay_signature,
//             amount: amountInRupees,
//             status: 'pending',
//         };
//         if (serviceType === "Delivery Now") {
//             await Order.create(orderData);
//             return res.status(200).json({ message: 'Order created successfully' });
//         } else if (serviceType === "Schedule for Later") {
//             if (!pickupDate || !pickupTime) {
//                 return res.status(400).json({ error: 'Pickup date and time are required for scheduled deliveries' });
//             }
//             orderData.pickupDate = pickupDate;
//             orderData.pickupTime = pickupTime;

//             await Order.create(orderData);
//             return res.status(200).json({ message: 'Order created successfully' });
//         } else {
//             return res.status(400).json({ error: 'Invalid service type' });
//         }
//     } catch (err) {
//         console.error('Error processing order:', err.message);
//         return res.status(500).json({ error: 'Internal Server Error', message: err.message });
//     }
// });
// // Route to get all customer data
// router.get('/userData', async (req, res) => {
//     try {
//         const users = await Customer.findAll(); // Assuming you have a Customer model
//         res.json(users);
//     } catch (err) {
//         console.error('Error fetching data:', err);
//         res.status(500).json({ error: 'Error fetching data' });
//     }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { tokenRequired } = require('../middlewares/webMiddleware');

router.post('/submit', orderController.submitOrder);
router.post('/create-razorpay-order', orderController.createRazorpayOrder);
router.post('/usersubmit', tokenRequired,orderController.userSubmitOrder);
router.get('/userData', orderController.getUserData);

module.exports = router;
