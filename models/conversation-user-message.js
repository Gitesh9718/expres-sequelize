'use strict';
module.exports = (sequelize, DataTypes) => {
    const conversation_user_message = sequelize.define('conversationUserMessage', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },
        conversationId: {
            type: DataTypes.BIGINT,
            references: {model: 'conversations', key: 'id'},
            allowNull: false
        },
        conversationMessageId: {
            type: DataTypes.BIGINT,
            references: {model: 'conversationMessages', key: 'id'},
            allowNull: false
        },
        isPinnedMessage: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        userId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('SENT', 'DELIVERED', 'READ'),
            defaultValue: 'SENT',
            allowNull: true
        },
    }, {
        paranoid: true
    });
    conversation_user_message.associate = function (models) {
        // associations can be defined here
        this.belongsTo(models.conversationMessage);
    };
    return conversation_user_message;
};
