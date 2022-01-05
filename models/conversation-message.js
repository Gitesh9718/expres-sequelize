'use strict';
module.exports = (sequelize, DataTypes) => {
    const conversation_message = sequelize.define('conversationMessage', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        conversationId: {
            type: DataTypes.BIGINT,
            references: {model: 'conversations', key: 'id'},
            allowNull: false
        },
        replyId: {
            type: DataTypes.BIGINT,
            references: {model: 'conversationMessage', key: 'id'},
            allowNull: true,
            defaultValue: null
        },
        text: {
            type: DataTypes.TEXT
        },
        fileId: {
            type: DataTypes.BIGINT,
            references: {model: 'files', key: 'id'},
            allowNull: true
        },
        postId: {
            type: DataTypes.BIGINT,
            references: {model: 'posts', key: 'id'},
            allowNull: true
        },
        recommendUserId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
            allowNull: true
        },
        introducedUserId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
            allowNull: true
        },
        userId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
            allowNull: false
        },
        originalMessageCreatorId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
            allowNull: true
        },
    }, {
        paranoid: true
    });

    conversation_message.associate = function (models) {
        // associations can be defined here
        this.belongsTo(models.conversationMessage, {as: 'reply', foreignKey: 'replyId'});
        this.belongsTo(models.file);
        this.belongsTo(models.user);
        this.belongsTo(models.user, {as: 'recommendUser', foreignKey: 'recommendUserId'});
        this.belongsTo(models.user, {as: 'introducedUser', foreignKey: 'introducedUserId'});
        this.belongsTo(models.user, {as: 'originalMessageCreator', foreignKey: 'originalMessageCreatorId'});
        this.belongsTo(models.post);
        this.hasMany(models.conversationUserMessage);
        this.hasOne(models.conversationUser, {
            foreignKey: 'conversationId', // <--- one of the column of table2 : not a primary key here in my case; can be primary key also
            sourceKey: 'conversationId', // <---  one of the column of table1 : not a primary key here in my case; can be a primary key also
            as: 'conversationUser',
        });
    };
    return conversation_message;
};
