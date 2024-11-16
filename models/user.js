const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: false,
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    phone_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    otp: {
        type: DataTypes.STRING(6),
        allowNull: true,
    },
    otp_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    registration_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    role: {
        type: DataTypes.STRING(10),
        defaultValue: 'user',
    },
});

// Export the model without the association here
module.exports = User;    