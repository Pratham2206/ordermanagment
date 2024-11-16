
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Token = sequelize.define('Token', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: { // Changed from user_id to userId
    type: DataTypes.INTEGER,
    references: {
      model: 'Employees',
      key: 'id',
    },
    allowNull: false, // Set to false if every token must have a userId
    unique: false, // Ensures a user can only have one active token
  },
  token: {
    type: DataTypes.STRING(512), // Updated to allow for longer token values
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isBlacklisted: {
    type: DataTypes.BOOLEAN, // Use DataTypes instead of Sequelize
    defaultValue: false,
    allowNull: false, // Set the default to not blacklisted
  },
}, 
{
  // If you want to track createdAt and updatedAt timestamps, set timestamps to true
  timestamps: true, // Enable automatic timestamps (createdAt and updatedAt)
});

module.exports = Token;
