'use strict';

module.exports = (sequelize, DataTypes) => {
    const post = sequelize.define('post', {
        id: {
            type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT, allowNull: false, references: { model: 'users', key: 'id' }
        },
        parentId: {
            type: DataTypes.BIGINT, allowNull: true, references: { model: 'posts', key: 'id' }
        },
        type: {
            type: DataTypes.ENUM, values: ['REQUEST', 'POST'], defaultValue: 'REQUEST'
        },
        title: {
            type: DataTypes.STRING, allowNull: true
        },
        description: {
            type: DataTypes.TEXT, allowNull: true
        },
        fileId: {
            type: DataTypes.BIGINT, allowNull: true, references: { model: 'files', key: 'id' }
        },
        audioId: {
            type: DataTypes.BIGINT, allowNull: true, references: { model: 'files', key: 'id' }
        },
        intention: {
            type: DataTypes.TEXT, allowNull: true
        },
        link: {
            type: DataTypes.TEXT, allowNull: true
        },
        status: {
            type: DataTypes.ENUM,
            values: [_appConstant.POST_STATUS_OPEN, _appConstant.POST_STATUS_CLOSED],
            defaultValue: _appConstant.POST_STATUS_OPEN,
            allowNull: false
        },
        desiredOutput: {
            type: DataTypes.TEXT, allowNull: true
        },
        agenda: {
            type: DataTypes.TEXT, allowNull: true
        },
        rules: {
            type: DataTypes.TEXT, allowNull: true
        },
        timing: {
            type: DataTypes.TEXT, allowNull: true
        },
        isApplicableForChat: {
            type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false
        },
        forwardToConvoType: {
            type: DataTypes.ENUM,
            values: ['SINGLE', 'GROUP'],
            allowNull: true,
            defaultValue: null
        },
        repostedCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
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
        },
        totalComments: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        forwardedCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        bookmarkedCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        activitiesCount: {
            type: DataTypes.VIRTUAL,
            get () {
                return this.getDataValue('repostedCount') + this.getDataValue('totalComments') + this.getDataValue('forwardedCount') + this.getDataValue('bookmarkedCount') + this.getDataValue('totalAwards');
            }
        },
        commentCount: {
            type: DataTypes.VIRTUAL,
            get () {
                return this.getDataValue('totalComments');
            }
        },
        favouriteCount: {
            type: DataTypes.VIRTUAL,
            get () {
                return this.getDataValue('bookmarkedCount');
            }
        },
        isBlocked: {
            type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false
        },
        updatedBy: {
            type: DataTypes.BIGINT, allowNull: true, references: { model: 'users', key: 'id' }
        }
    }, {
        timestamps: true,
        underscored: false,
        paranoid: true
    });

    post.associate = function (models) {
        this.belongsTo(models.post, { as: 'parentPost', foreignKey: 'parentId' });
        this.belongsTo(models.user);
        this.belongsToMany(models.hashTag, {
            through: models.postHashTag,
            foreignKey: 'postId',
            otherKey: 'hashTagId'
        });
        this.belongsToMany(models.user, {
            through: models.favourite,
            foreignKey: 'postId',
            otherKey: 'userId',
            as: 'isFavourite'
        });
        this.belongsTo(models.file);
        this.hasMany(models.favourite);
        this.hasMany(models.comment);
        this.hasMany(models.postLike, { as: 'liked', foreignKey: 'postId' });

        this.belongsTo(models.file, { as: 'audioFile', foreignKey: 'audioId' });
    };

    return post;
};
