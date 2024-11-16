const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const AssignedOrder = sequelize.define('AssignedOrder', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id',
    },
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  driver_name: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  driver_phone_number: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'picked', 'delivered'),
    allowNull: false,
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
  pickupAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dropAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  pickupDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  pickupTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  receiverPhonenumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  receiverName: {
    type: DataTypes.STRING(40),
    allowNull: false,
},
  otp: {
    type: DataTypes.STRING(6),
    allowNull: true,
  },
  deliveryInstructions: {
    type: DataTypes.TEXT,
    allowNull: true, // Optional field
},
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, 
{
  timestamps: false,
  tableName: 'Assigned_orders',  // Ensures the model matches the existing table name
});

module.exports = AssignedOrder;
