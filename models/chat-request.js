'use strict';
module.exports = (sequelize, DataTypes) => {
    const chatRequest = sequelize.define('chatRequest', {
        id: {type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true},
        status: {
            type: DataTypes.ENUM,
            values: ['PENDING', 'APPROVED', 'REJECTED'],
            defaultValue: 'PENDING',
        },
        userId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
            allowNull: false
        },
        requestedUserId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
            allowNull: false
        },
        approverUserId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
            allowNull: false
        },
        message: {type: DataTypes.TEXT, allowNull: false},
        rejectReason: {type: DataTypes.TEXT, allowNull: true},
    }, {});
    chatRequest.associate = function (models) {
        this.belongsTo(models.user, {as: 'user', foreignKey: 'userId'});
        this.belongsTo(models.user, {as: 'requestedUser', foreignKey: 'requestedUserId'});
        this.belongsTo(models.user, {as: 'approverUser', foreignKey: 'approverUserId'});
    };
    return chatRequest;
};
