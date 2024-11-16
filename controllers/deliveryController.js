require('dotenv').config();
const {sendEmail, createEmailTemplate} = require('../services/emailConformations');
const { generateOTP } = require('../services/genarateOtp');
const Order = require('../models/order');
const AssignedOrder = require('../models/assignedOrder');
const DeliveryBoy = require('../models/deliveryBoy');
const { Op } = require('sequelize');

exports.fetchPendingOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: 'pending',
        pickupTime: {
          [Op.is]: null // Fetch orders where pickupTime is null
        }
      }
    });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

exports.fetchScheduledOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: 'pending',
        pickupTime: {
          [Op.not]: null // Check that pickupTime is not null
        }
      }
    });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

exports.fetchAssignedOrders = async (req, res) => {
  try {
    const orders = await AssignedOrder.findAll({ where: { status: ['active', 'picked', 'delivered'] } });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching assigned orders:', err);
    res.status(500).json({ error: 'Error fetching assigned orders' });
  }
};

exports.assignOrder = async (req, res) => {
  const { orderId, driverPhoneNumber, driverName, userId } = req.body;

  try {
    const order = await Order.findOne({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const otp = generateOTP();

    const assignedOrder = await AssignedOrder.create({
      order_id: orderId,
      driver_id: userId,
      driver_name: driverName,
      driver_phone_number: driverPhoneNumber,
      status: 'active',
      phoneNumber: order.phoneNumber,
      name: order.name,
      email: order.email,
      pickupAddress: order.pickupAddress,
      dropAddress: order.dropAddress,
      content: order.content,
      weight: order.weight,
      pickupDate: order.pickupDate,
      pickupTime: order.pickupTime,
      dropTime: order.dropTime,
      createdAt: order.createdAt,
      receiverPhonenumber: order.receiverPhonenumber,
      receiverName: order.receiverName,
      senderAddress:order.senderAddress,
      receiverAddress:order.receiverAddress,
      deliveryInstructions: order.deliveryInstructions,
      otp: otp,
    });

    await Order.update({ status: 'active', assignedDriver: driverName }, { where: { id: orderId } });
    await DeliveryBoy.update({ available: 'assigned' }, { where: { phonenumber: driverPhoneNumber } });

    const driver = await DeliveryBoy.findOne({ where: { phonenumber: driverPhoneNumber } });
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    const driverEmail = driver.email;
    // Send notification to the customer
    const customerMessage = createEmailTemplate(
      'Order Assigned',
      `Dear ${order.name},<br><br>
      Your order with (ID: ${orderId}) has been assigned to a driver. The driver details are as follows:<br><br>
       - Name: ${driverName}<br><br>
       -Phone Number: ${driverPhoneNumber}<br><br>
      Thank you for choosing TURTU.`
    );
    
    await sendEmail(order.email, 'Order Assigned', customerMessage);
// Example of how you might call sendEmail
const driverMessage = createEmailTemplate('New Order Assigned', `
  Dear ${driverName},<br><br>
  You have been assigned a new order with (ID:${orderId}). The order details are as follows:<br><br>
   - Pickup Address: ${order.pickupAddress}<br><br>
   - Drop Address: ${order.dropAddress}<br><br>
   - Content: ${order.content}<br><br>
   - Weight: ${order.weight}<br><br>
   - Pickup Date: ${order.pickupDate}<br><br>
   - Pickup Time: ${order.pickupTime}<br><br>
   - customer number : ${order.phoneNumber}<br><br>
   - Please contact the customer if necessary.<br><br>
  Thank you for choosing TURTU.
`);

await sendEmail(driverEmail, 'New Order Assigned to you', driverMessage);
    res.status(201).json({ message: 'Driver assigned successfully and emails sent!', assignedOrder });
  } catch (err) {
    console.error('Error assigning order:', err);
    res.status(500).json({ error: 'Error assigning order' });
  }
};

exports.fetchAssignedOrdersByDriver = async (req, res) => {
  const { driver_id } = req.params;
  try {
    const assignedOrders = await AssignedOrder.findAll({
      where: { driver_id },
    });
    if (assignedOrders.length > 0) {
      res.status(200).json(assignedOrders);
    } else {
      res.status(404).json({ message: 'No assigned orders found for this driver' });
    }
  } catch (error) {
    console.error('Error retrieving assigned orders:', error);
    res.status(500).json({ error: 'Failed to retrieve assigned orders' });
  }
};

exports.fetchOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await AssignedOrder.findOne({
      where: { order_id: orderId },
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching assigned orders:', error);
    res.status(500).json({ message: 'Error fetching assigned orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId, status, driverUserId } = req.body;

  // Validate request parameters
  if (!orderId || !status || !driverUserId) {
    return res.status(400).json({ message: 'Order ID, status, and driver user ID are required' });
  }

  // Validate the status field
  if (!['active', 'picked', 'delivered'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    // Fetch the current order and assigned order simultaneously
    const [currentOrder, assignedOrder] = await Promise.all([
      Order.findByPk(orderId),
      AssignedOrder.findOne({ where: { order_id: orderId } })
    ]);

    // Check if the order or assigned order exists
    if (!currentOrder || !assignedOrder) {
      return res.status(404).json({ message: 'Order or assigned order not found' });
    }

    // Extract customer details
    const { email: customerEmail, name: customerName } = currentOrder;
    const deliveryOtp = assignedOrder.otp;

    // Ensure the order has not already been delivered
    if (currentOrder.status === 'delivered') {
      return res.status(400).json({ message: 'Order is already delivered' });
    }

    // Prevent status reversal from 'picked' to 'active'
    if (currentOrder.status === 'picked' && status === 'active') {
      return res.status(400).json({ message: 'Cannot revert to active from picked' });
    }

    // Update the order status in both the Order and AssignedOrder tables
    await Promise.all([
      Order.update({ status }, { where: { id: orderId } }),
      AssignedOrder.update({ status }, { where: { order_id: orderId } })
    ]);

    // Handle the case when the status is 'delivered'
    if (status === 'delivered') {
      // Update driver availability
      const driver = await DeliveryBoy.findOne({ where: { employee_id: driverUserId } });
      if (driver) {
        await driver.update({ available: 'available' });
      }
      const customerDeliveredMessage =  createEmailTemplate(
        'Order Successfully Delivered',
        `Dear ${customerName},<br>
         We are delighted to inform you that your order (ID: ${orderId}) has been successfully delivered.<br>
         Thank you for choosing TURTU! We hope you enjoy your purchase.`
    );
    await sendEmail(customerEmail, 'Order Successfully Delivered', customerDeliveredMessage);
    }
    // Handle the case when the status is 'picked'
    if (status === 'picked') {
// Prepare the body content with HTML formatting
    const customerOtpBody = `
    Dear ${customerName},<br><br>
    Your order with (ID :${orderId}) has been picked up and is on its way.<br>
    Please provide the following OTP to the delivery driver upon arrival:<br>
    <strong style="font-size: 24px; color: #007bff;">OTP: ${deliveryOtp}</strong><br><br>
    Thank you for choosing TURTU.
`;
// Create the email message using the HTML template
const customerOtpMessage =  createEmailTemplate('Your Delivery OTP', customerOtpBody);
// Send the email
await sendEmail(customerEmail, 'Your Delivery OTP', customerOtpMessage);

    }

    // Return a success response
    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (err) {
    // Log any error and return a 500 response
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

exports.verifyDeliveryOtp = async (req, res) => {
  const { orderId, providedOtp } = req.body;

  if (!orderId || !providedOtp) {
    return res.status(400).json({ message: 'Order ID and OTP are required' });
  }

  try {
    const assignedOrder = await AssignedOrder.findOne({ where: { order_id: orderId } });
    if (!assignedOrder) {
      return res.status(404).json({ message: 'Assigned order not found' });
    }

    if (assignedOrder.otp !== providedOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await AssignedOrder.update({ otp: null }, { where: { order_id: orderId } });
    res.status(200).json({ message: 'OTP verified successfully',valid: true  });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ message: 'Error verifying OTP',valid: false  });
  }
};
