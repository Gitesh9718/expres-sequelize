'use strict';
const Constants = require('app/Constants/constant');

module.exports = (sequelize, DataTypes) => {
    const conversation_user = sequelize.define('conversationUser', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },
        conversationId: {
            type: DataTypes.BIGINT,
            references: { model: 'conversations', key: 'id' },
            allowNull: false
        },
        userId: {
            type: DataTypes.BIGINT,
            references: { model: 'users', key: 'id' },
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('ADMIN', 'USER'),
            defaultValue: Constants.CHAT_ROLE_USER
        },
        lastMessageId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: { model: 'conversationMessages', key: 'id' }
        },
        muteOn: {
            type: DataTypes.DATE,
            allowNull: true
        },
        muteDuration: {
            type: DataTypes.BIGINT.UNSIGNED,
            defaultValue: 0
        },
        unreadMessageCount: {
            type: DataTypes.STRING,
            defaultValue: 0,
            allowNull: true
        }
    }, {
        paranoid: true
    });
    conversation_user.associate = function (models) {
        this.belongsTo(models.user);
        this.belongsTo(models.conversationMessage, { as: 'lastMessage', foreignKey: 'lastMessageId' });
    };
    return conversation_user;
};
