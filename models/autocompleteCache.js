// models/AutocompleteCache.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // import your Sequelize instance

const AutocompleteCache = sequelize.define('AutocompleteCache', {
    input: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false, // Ensure the input is unique
    },
    response: {
        type: DataTypes.JSON, // Store the autocomplete results as JSON
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false, // disable automatic createdAt and updatedAt fields
    tableName: 'AutocompleteCache'
});

module.exports = AutocompleteCache;
