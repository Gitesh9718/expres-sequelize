'use strict';
module.exports = (sequelize, DataTypes) => {
    const postLike = sequelize.define('postLike', {
        id: {
            type: DataTypes.BIGINT, 
            allowNull: false, 
            primaryKey: true, 
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {model: 'users', key: 'id'}
        },
        postId: {
            type: DataTypes.BIGINT,
            allowNull: false, 
            references: {model: 'posts', key: 'id'}
        }
    }, {
        timestamps: true,
        underscored: false,
        paranoid: true,
    });

    postLike.associate = function (models) {
        this.belongsTo(models.user);
    };

    return postLike;
};