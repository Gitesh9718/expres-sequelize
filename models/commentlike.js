'use strict';
module.exports = (sequelize, DataTypes) => {
    const commentLike = sequelize.define('commentLike', {
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
        commentId: {
            type: DataTypes.BIGINT,
            allowNull: false, 
            references: {model: 'comments', key: 'id'}
        }
    }, {
        timestamps: true,
        underscored: false,
        paranoid: true,
    });

    commentLike.associate = function (models) {
        // associations can be defined here
        this.belongsTo(models.user);
    };

    return commentLike;
};