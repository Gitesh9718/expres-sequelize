'use strict';
module.exports = (sequelize, DataTypes) => {
    const favorite = sequelize.define('favourite', {
        id: {
            type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT, allowNull: false, references: {model: 'users', key: 'id'}
        },
        postId: {
            type: DataTypes.BIGINT, allowNull: false, references: {model: 'posts', key: 'id'}
        }
    }, {
        timestamps: true,
        underscored: false,
        paranoid: true,
    });

    favorite.associate = function (models) {
        // associations can be defined here
    };

    return favorite;
};