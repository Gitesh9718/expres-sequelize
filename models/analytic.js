'use strict';
module.exports = (sequelize, DataTypes) => {
    const analytic = sequelize.define('analytic', {
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        users: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        newUsers: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        activeUsers: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        totalPosts: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        posts: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        requestPosts: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        postForwards: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        comments: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        bilateralChats: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        groups: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        introduceGroups: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        sessionTimeSpent: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        }
    }, {});
    analytic.associate = function (models) {
        // associations can be defined here
    };
    return analytic;
};
