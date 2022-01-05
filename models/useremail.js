'use strict';

module.exports = (sequelize, DataTypes) => {
    const userEmail = sequelize.define('userEmail', {
            id: {
                allowNull: false, autoIncrement: true,
                primaryKey: true, type: DataTypes.BIGINT
            },
            userId: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {model: 'users', key: 'id'}
            },
            email: {
                type: DataTypes.STRING(190),
                allowNull: false,
                validate: {isEmail: {msg: "Invalid Email"}}
            }
        },
        {
            timestamps: true,
            paranoid: true
        });

    userEmail.associate = function (models) {
        this.belongsTo(models.user);
    };

    return userEmail;
};
