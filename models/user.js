'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define('userMeta', {
        id: {type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true},
        email: {
            type: DataTypes.STRING(190),
            allowNull: false,
            unique: true,
            validate: {isEmail: {msg: "Email is invalid."}}
        },
        password: DataTypes.STRING,
    }, {
        paranoid: true
    });

    user.associate = function (models) {
        // associations can be defined here
    };

    user.beforeSave(user => {
        if (user.changed('password')) {
            user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        }
    });

    user.prototype.comparePassword = function (pw) {
        return bcrypt.compareSync(pw, this.password);
    };

    return user;
};
