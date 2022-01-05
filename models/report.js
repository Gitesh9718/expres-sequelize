'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    const report = sequelize.define('report', {
            userId: {
                type: DataTypes.BIGINT,
                references: {model: 'users', key: 'id'},
                allowNull: false
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false
            },
            typeId: {
                type: DataTypes.BIGINT,
                allowNull: false
            },
            text: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            concernTo: {
                type: DataTypes.STRING,
                allowNull: true
            },
        },
        {
            paranoid: true
        }
    );

    report.associate = function (models) {
        // associations can be defined here
    };

    return report;
};
