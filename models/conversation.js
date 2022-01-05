'use strict';
module.exports = (sequelize, DataTypes) => {
    const conversation = sequelize.define('conversation', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rule: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        type: {
            type: DataTypes.ENUM,
            values: ['GROUP', 'SINGLE']
        },
        groupType: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lastMessageId: {
            type: DataTypes.BIGINT, allowNull: true, references: {model: 'conversationMessages', key: 'id'}
        },
        imageId: {
            type: DataTypes.BIGINT, allowNull: true, references: {model: 'files', key: 'id'}
        },
        createdBy: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
            allowNull: true
        },
    }, {
        paranoid: true
    });
    conversation.associate = function (models) {
        // associations can be defined here
        // this.belongsTo(models.conversationMessage);
        this.hasMany(models.conversationUser);
        this.hasOne(models.conversationUser, {as: 'conversationUser', foreignKey: 'conversationId'});
        this.hasOne(models.conversationUser, {as: 'conversationReceiver', foreignKey: 'conversationId'});
        this.hasMany(models.conversationUser, {as: 'conversationReceivers', foreignKey: 'conversationId'});
        this.hasMany(models.conversationUserMessage, {foreignKey: 'conversationId'});
        this.belongsTo(models.conversationMessage, {as: 'lastMessage', foreignKey: 'lastMessageId'});
        this.belongsTo(models.file, {as: 'image', foreignKey: 'imageId'});
        this.belongsTo(models.user, {as: 'createdByUser', foreignKey: 'createdBy'});
    };
    return conversation;
};
