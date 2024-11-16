const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Pricing = sequelize.define('Pricing', {
    base_distance: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    base_fare: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    extra_fare_per_km: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    weight_bracket_start: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    weight_bracket_end: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    weight_fare: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    tableName: 'Pricing',
    timestamps: false // Set to true if you have timestamps in your table
});

module.exports = Pricing;