'use strict';
module.exports = (sequelize, DataTypes) => {
    const user_device = sequelize.define('userDevice', {
        id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
        userId: {
            type: DataTypes.BIGINT,
            references: { model: 'users', key: 'id' }
        },
        uuid: {
            type: DataTypes.STRING
        },
        token: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.ENUM,
            values: ['IOS', 'ANDROID']
        },
        version: {
            type: DataTypes.STRING
        },
        model: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: true,
        underscored: false,
        paranoid: true
    });
    user_device.associate = function (models) {
        // associations can be defined here
    };
    return user_device;
};
