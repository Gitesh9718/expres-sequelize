'use strict';

module.exports = (sequelize, DataTypes) => {
    const comment = sequelize.define('comment', {
        id: {
            type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true
        },
        parentId: {
            type: DataTypes.BIGINT, allowNull: true, references: { model: 'comments', key: 'id' }
        },
        postId: {
            type: DataTypes.BIGINT, allowNull: false, references: { model: 'posts', key: 'id' }
        },
        userId: {
            type: DataTypes.BIGINT, allowNull: false, references: { model: 'users', key: 'id' }
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isBestAnswer: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        totalAwards: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        likesCount: {
            type: DataTypes.VIRTUAL,
            get () {
                return this.getDataValue('totalAwards');
            }
        }

    }, {
        timestamps: true,
        underscored: false,
        paranoid: true
    });

    comment.associate = function (models) {
        this.user = this.belongsTo(models.user);
        this.replies = this.hasMany(models.comment, { as: 'replies', foreignKey: 'parentId' });
        this.liked = this.hasMany(models.commentLike, { as: 'liked', foreignKey: 'commentId' });
    };

    return comment;
};
