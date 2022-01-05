'use strict';
module.exports = (sequelize, DataTypes) => {
    const Referral = sequelize.define('referral', {
        invitationId: {
            type: DataTypes.BIGINT, allowNull: true, references: {model: 'invitations', key: 'id'}
        },
        userId: {
            type: DataTypes.BIGINT, allowNull: false, references: {model: 'users', key: 'id'}
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            //unique: true,
            //validate: {isEmail: {msg: "Email is invalid."}}
        },
        code: {
            type: DataTypes.STRING, allowNull: false
        },
        usedAt: {type: DataTypes.DATE, allowNull: true, defaultValue: null},
        rejectedAt: {type: DataTypes.DATE, allowNull: true, defaultValue: null},
        expiredAt: {type: DataTypes.DATE, allowNull: true, defaultValue: null},
    }, {});
    Referral.associate = function (models) {
        // associations can be defined here
    };
    return Referral;
};
