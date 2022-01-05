'use strict';
module.exports = (sequelize, DataTypes) => {
    const reportUser = sequelize.define('reportUser', {
        userId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
            allowNull: false
        },
        reportedUserId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
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
    }, {});
    reportUser.associate = function (models) {
        // associations can be defined here
    };
    return reportUser;
};
