// controllers/orderController.js
require('dotenv').config({ path: './backend/.env' });
const { sendEmail } = require('../services/emailConformations');
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

    const customerMessage = `
      Dear ${order.name}, 
      Your order with ID ${orderId} has been assigned to a driver. The driver details are as follows:
      Name: ${driverName}
      Phone Number: ${driverPhoneNumber}
      Thank you for choosing Turtu.
      Best regards,
      The Turtu Team
    `;
    await sendEmail(order.email, 'Order Assigned', customerMessage);

    const driverMessage = `
      Dear ${driverName},
      You have been assigned a new order with ID ${orderId}. The order details are as follows:
      Pickup Address: ${order.pickupAddress}
      Drop Address: ${order.dropAddress}
      Content: ${order.content}
      Weight: ${order.weight}
      Pickup Date: ${order.pickupDate}
      Pickup Time: ${order.pickupTime}
      Please contact the customer if necessary.
      Best regards,
      The Turtu Team
    `;
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

  if (!orderId || !status || !driverUserId) {
    return res.status(400).json({ message: 'Order ID, status, and driver user ID are required' });
  }

  if (!['active', 'picked', 'delivered'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const [currentOrder, assignedOrder] = await Promise.all([
      Order.findByPk(orderId),
      AssignedOrder.findOne({ where: { order_id: orderId } })
    ]);

    if (!currentOrder || !assignedOrder) {
      return res.status(404).json({ message: 'Order or assigned order not found' });
    }

    const { email: customerEmail, name: customerName } = currentOrder;
    const deliveryOtp = assignedOrder.otp;

    if (currentOrder.status === 'delivered') {
      return res.status(400).json({ message: 'Order is already delivered' });
    }

    if (currentOrder.status === 'picked' && status === 'active') {
      return res.status(400).json({ message: 'Cannot revert to active from picked' });
    }

    await Promise.all([
      Order.update({ status }, { where: { id: orderId } }),
      AssignedOrder.update({ status }, { where: { order_id: orderId } })
    ]);

    if (status === 'delivered') {
      const driver = await DeliveryBoy.findOne({ where: { user_id: driverUserId } });
      if (driver) {
        await driver.update({ available: 'available' });
      }

      const customerDeliveredMessage = `
        Dear ${customerName},
        We are delighted to inform you that your order (ID: ${orderId}) has been successfully delivered.
        Thank you for choosing Turtu! We hope you enjoy your purchase.
        Best regards,
        The Turtu Team
      `;
      await sendEmail(customerEmail, 'Order Successfully Delivered', customerDeliveredMessage);
    }

    if (status === 'picked') {
      const customerOtpMessage = `
        Dear ${customerName},
        Your order with ID ${orderId} has been picked up and is on its way.
        Please provide the following OTP to the delivery driver upon arrival:
        OTP: ${deliveryOtp}
        Thank you for choosing Turtu.
        Best regards,
        The Turtu Team
      `;
      await sendEmail(customerEmail, 'Your Delivery OTP', customerOtpMessage);
    }

    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (err) {
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
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};
