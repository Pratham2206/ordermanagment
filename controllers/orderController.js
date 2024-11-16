const Order = require('../models/order');
const Customer = require('../models/customer');
const Razorpay = require("razorpay");
const crypto = require('crypto');
require('dotenv').config();
const {sendEmail, createEmailTemplate} = require('../services/emailConformations');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// Function to handle order submission
const submitOrder = async (req, res) => {
    const {
        serviceType,
        name,
        phoneNumber,
        email,
        weight,
        pickupAddress,
        dropAddress,
        content,
        deliveryInstructions,
        receiverPhonenumber,
        receiverName,
        pickupDate,
        pickupTime
    } = req.body;

    try {
        let customer = await Customer.findOne({ where: { email } });
        if (!customer) {
            customer = await Customer.create({
                name,
                phoneNumber,
                email,
                pickupAddress,
                dropAddress,
                receiverPhonenumber,
                receiverName,
                content,
                weight,
            });
        }
        if (serviceType === "Delivery Now") {
            await Order.create({
                phoneNumber,
                name,
                email,
                weight,
                pickupAddress,
                dropAddress,
                content,
                deliveryInstructions,
                receiverPhonenumber,
                receiverName,
                status: 'pending',
            });
            res.status(200).send('Immediate delivery order created successfully');
        } else if (serviceType === "Schedule for Later") {
            if (!pickupDate || !pickupTime) {
                return res.status(400).send('Pickup date and time are required for scheduled deliveries');
            }

            await Order.create({
                customerId: customer.id,
                phoneNumber,
                name,
                email,
                weight,
                pickupAddress,
                dropAddress,
                content,
                deliveryInstructions,
                receiverPhonenumber,
                receiverName,
                pickupDate,
                pickupTime,
                status: 'pending',
            });
            res.status(200).send('Scheduled delivery order created successfully');
        } else {
            res.status(400).send('Invalid service type');
        }
    } catch (err) {
        console.error('Error processing order:', err);
        res.status(500).send('Error creating the order');
    }
};

// Function to create a Razorpay order
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency, receipt } = req.body;
        if (!amount || !currency) {
            return res.status(400).json({ error: 'Amount and currency are required' });
        }
        const options = {
            amount: amount,
            currency: currency,
            receipt: receipt || `receipt#${Date.now()}`,
        };
        const razorpayOrder = await razorpay.orders.create(options);
        res.json(razorpayOrder);
    } catch (error) {
        console.error('Error creating Razorpay order:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

// Function to handle user order submission
const userSubmitOrder = async (req, res) => {
    const {
        serviceType,
        name,
        phoneNumber,
        email,
        weight,
        pickupAddress,
        dropAddress,
        content,
        deliveryInstructions,
        receiverPhonenumber,
        receiverName,
        pickupDate,
        pickupTime,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        amount,
    } = req.body;

    try {
        // Verify Razorpay payment
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');
        if (digest !== razorpay_signature) {
            return res.status(400).json({ status: 'failed' });
        }

        let customer = await Customer.findOne({ where: { email } });
        if (!customer) {
            customer = await Customer.create({
                name,
                phoneNumber,
                email,
                pickupAddress,
                dropAddress,
                receiverPhonenumber,
                receiverName,
                content,
                weight,
            });
        }

        const amountInRupees = (amount / 100).toFixed(2);
        const orderData = {
            customerId: serviceType === "Delivery Now" ? null : customer.id,
            phoneNumber,
            name,
            email,
            weight,
            pickupAddress,
            dropAddress,
            content,
            deliveryInstructions,
            receiverPhonenumber,
            receiverName,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            amount: amountInRupees,
            status: 'pending',
        };

        let order; // Define the order variable outside the conditional blocks

        if (serviceType === "Delivery Now") {
            order = await Order.create(orderData);
        } else if (serviceType === "Schedule for Later") {
            if (!pickupDate || !pickupTime) {
                return res.status(400).json({ error: 'Pickup date and time are required for scheduled deliveries' });
            }
            orderData.pickupDate = pickupDate;
            orderData.pickupTime = pickupTime;
            order = await Order.create(orderData);
        } else {
            return res.status(400).json({ error: 'Invalid service type' });
        }

        // Now you can safely access the order.id
        const orderId = order.id; // Get the order ID from the created order
        
        // Send notification to the customer after everything is completed
        const customerMessage = createEmailTemplate(
            'Order Confirmation',
            `Dear ${name},<br><br>
                Thank you for placing your order. Here are the details:<br>
                - Order ID: ${orderId}<br>
                - Service Type: ${serviceType}<br>
                - Pickup Address: ${pickupAddress}<br>
                - Drop Address: ${dropAddress}<br>
                - Weight: ${weight} kg<br>
                - Amount: Online Payment ₹${amountInRupees}<br><br>
                We will keep you updated on the status of your delivery.<br><br>
                Thank you for choosing TURTU.`
        );

        try {
            await sendEmail(email, 'Order Confirmation', customerMessage);
            console.log('Order confirmation email sent successfully to', email);
        } catch (error) {
            console.error('Error sending order confirmation email:', error);
        }

        return res.status(200).json({ message: 'Order created successfully' });

    } catch (err) {
        console.error('Error processing order:', err.message);
        return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
};

// Function to get all customer data
const getUserData = async (req, res) => {
    try {
        const users = await Customer.findAll();
        res.json(users);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Error fetching data' });
    }
};

module.exports = {
    submitOrder,
    createRazorpayOrder,
    userSubmitOrder,
    getUserData,
};
