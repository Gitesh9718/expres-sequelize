/* global _appConstant */

'use strict';
module.exports = (sequelize, DataTypes) => {
    const notification = sequelize.define('notification', {
        id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
        type: {
            type: DataTypes.ENUM,
            values: [
                _appConstant.NOTIFICATION_TYPE_COMMENT, _appConstant.NOTIFICATION_TYPE_COMMENT_REPLY,
                _appConstant.NOTIFICATION_TYPE_FORWARD, _appConstant.NOTIFICATION_TYPE_BOOKMARK, _appConstant.NOTIFICATION_TYPE_INVITATION,
                _appConstant.NOTIFICATION_TYPE_INVITATION_ACCEPT, _appConstant.NOTIFICATION_TYPE_MESSAGE,
                _appConstant.NOTIFICATION_TYPE_AWARD_COMMENT, _appConstant.NOTIFICATION_TYPE_AWARD_POST,
                _appConstant.NOTIFICATION_TYPE_AWARD_USER, _appConstant.NOTIFICATION_TYPE_NEW_GROUP_ADMIN
            ]
        },
        typeId: {
            type: DataTypes.BIGINT, allowNull: true
        },
        postId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: { model: 'posts', key: 'id' }
        },
        actionOwnerId: {
            type: DataTypes.BIGINT,
            references: { model: 'users', key: 'id' }
        },
        userId: {
            type: DataTypes.BIGINT,
            references: { model: 'users', key: 'id' }
        },
        text: {
            type: DataTypes.TEXT
        },
        isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
        isSend: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
        timestamps: true,
        paranoid: true
    });
    notification.associate = function (models) {
        this.belongsTo(models.user);
        this.belongsTo(models.user, { as: 'actionOwner', foreignKey: 'actionOwnerId' });
        this.belongsTo(models.post);
    };
    return notification;
};
