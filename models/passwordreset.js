'use strict';
module.exports = (sequelize, DataTypes) => {
    const PasswordReset = sequelize.define('passwordReset', {
        email: DataTypes.STRING,
        otp: DataTypes.INTEGER
    }, {
        timestamps: true,
    });
    PasswordReset.associate = function (models) {
        // associations can be defined here
    };
    return PasswordReset;
};