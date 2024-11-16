// models/DeliveryBoy.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const DeliveryBoy = sequelize.define('DeliveryBoy', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phonenumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('delivery boy'),
    defaultValue: 'delivery boy',
  },
  available: {
    type: DataTypes.ENUM('available', 'assigned'),
    defaultValue: 'available',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'employee_id', // Update the field name
},
}, 
{
  timestamps: false,
});

module.exports = DeliveryBoy;
