'use strict';
module.exports = (sequelize, DataTypes) => {

    const invitation = sequelize.define('invitation', {
        id: {type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true},
        userMetaId: {
            type: DataTypes.BIGINT, allowNull: false,
            references: {model: 'userMeta', key: 'id'}
        },
        userId: {
            type: DataTypes.BIGINT, allowNull: false,
            references: {model: 'users', key: 'id'}
        },
        friendMetaId: {
            type: DataTypes.BIGINT, allowNull: true,
            references: {model: 'userMeta', key: 'id'}
        },
        friendId: {
            type: DataTypes.BIGINT, allowNull: true,
            references: {model: 'users', key: 'id'}
        },
        name: {type: DataTypes.STRING, allowNull: true},
        email: {type: DataTypes.STRING, allowNull: true, validate: {isEmail: {msg: "Email is invalid."}}},
        publicText: {type: DataTypes.TEXT, allowNull: true, defaultValue: null},
        privateText: {type: DataTypes.TEXT, allowNull: true, defaultValue: null},
        acceptedAt: {type: DataTypes.DATE, allowNull: true, defaultValue: null},
        rejectedAt: {type: DataTypes.DATE, allowNull: true, defaultValue: null},
        isCleared: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
        sendAt: {type: DataTypes.DATE, allowNull: true, defaultValue: null},
    }, {
        paranoid: true
    });

    invitation.associate = function (models) {
        this.user = this.belongsTo(models.user, {as: 'user'});
        this.user = this.belongsTo(models.user, {as: 'friend'});
        this.userMeta = this.belongsTo(models.userMeta, {as: 'friendMeta'});
        this.hasOne(models.referral);
    };

    return invitation;
};
