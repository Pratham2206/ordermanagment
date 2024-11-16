// models/Customer.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Customer = sequelize.define('Customer', {
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
        unique: false,
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
        allowNull: false,
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    receiverName: {
        type: DataTypes.STRING(40),
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
    },
    receiverPhonenumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },   
}, 
{
    tableName: 'Customers',
    timestamps: false,
});

module.exports = Customer;