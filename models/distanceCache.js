// models/DistanceCache.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const DistanceCache = sequelize.define('DistanceCache', {
    origin: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    destination: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    distance_value: {
        type: DataTypes.INTEGER, // in meters
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false, // disable automatic createdAt and updatedAt fields
    tableName: 'DistanceCache'
});

module.exports = DistanceCache;
