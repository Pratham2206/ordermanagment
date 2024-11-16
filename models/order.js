const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Orders = sequelize.define('Orders', {
  id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },

  phoneNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
  },
  name: {
      type: DataTypes.STRING(40),
      allowNull: false,
  },
  email: {
      type: DataTypes.STRING(50),
      allowNull: false,
  },
  weight: {
      type: DataTypes.DECIMAL,
      allowNull: false,
  },
  pickupAddress: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  dropAddress: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  content: {
      type: DataTypes.STRING,
  },
  deliveryInstructions: {
      type: DataTypes.TEXT,
      allowNull: true, // Optional field
  },
  receiverPhonenumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
  },
  receiverName: {
      type: DataTypes.STRING(40),
      allowNull: false,
  },
  pickupDate: {
      type: DataTypes.DATE,
      allowNull: true, // Only for scheduled deliveries
  },
  pickupTime: {
      type: DataTypes.TIME,
      allowNull: true, // Only for scheduled deliveries
  },
  
  // Added Razorpay-related fields for payment
  razorpay_order_id: {
      type: DataTypes.STRING,
      allowNull: true, // Will be filled after Razorpay order creation
  },
  razorpay_payment_id: {
      type: DataTypes.STRING,
      allowNull: true, // Will be filled after successful payment
  },
  razorpay_signature: {
      type: DataTypes.STRING,
      allowNull: true, // Used for payment verification
  },
  amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, // Total order amount
  },
 
  status: {
      type: DataTypes.ENUM('pending', 'active', 'picked', 'delivered'),
      defaultValue: 'pending',
  },
  
  createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
  },
}, 
{
  timestamps: false,
  tableName: 'Orders',
});

module.exports = Orders;
