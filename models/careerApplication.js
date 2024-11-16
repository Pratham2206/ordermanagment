// models/CareerApplication.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Import your sequelize instance

const CareerApplication = sequelize.define('CareerApplication', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    phone_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    profile: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    resume_data: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
    },
    resume_filename: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Ensure this field cannot be null
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, 
{
    tableName: 'CareerApplication', // Specify the table name in the database
    timestamps: false, // Disable automatic timestamps since we are managing the createdAt field
});

// Export the model
module.exports = CareerApplication;
