'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
    const userMeta = sequelize.define('userMeta', {
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

    userMeta.associate = function (models) {
        // associations can be defined here
    };

    userMeta.beforeSave(user => {
        if (user.changed('password')) {
            user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        }
    });

    userMeta.prototype.comparePassword = function (pw) {
        return bcrypt.compareSync(pw, this.password);
    };

    userMeta.prototype.getJWT = function () {
        let expiration_time = parseInt(_config.jwt_expiration);
        return "Bearer " + jwt.sign({user_id: this.id}, _config.jwt_encryption, {expiresIn: expiration_time});
    };

    return userMeta;
};
