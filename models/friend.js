'use strict';

module.exports = (sequelize, DataTypes) => {
    const friend = sequelize.define('friend', {
        id: {type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true},
        userMetaId: {
            type: DataTypes.BIGINT, allowNull: false,
            references: {model: 'userMeta', key: 'id'}
        },
        userId: {
            type: DataTypes.BIGINT, allowNull: false,
            references: {model: 'users', key: 'id'}
        },
        friendMetaId: {
            type: DataTypes.BIGINT, allowNull: false,
            references: {model: 'userMeta', key: 'id'}
        },
        friendId: {
            type: DataTypes.BIGINT, allowNull: false,
            references: {model: 'users', key: 'id'}
        },
        isFavorite: {
            type: DataTypes.BOOLEAN, defaultValue: false
        },
        postCount: {
            type: DataTypes.BIGINT, allowNull: false, defaultValue: 0
        },
        lastPostAt: {
            type: DataTypes.DATE, allowNull: true, defaultValue: null,
        },
    }, {
        timestamps: true,
        underscored: false,
        paranoid: true,
    });

    friend.associate = function (models) {
        this.belongsTo(models.user, {foreignKey: 'friendId'});
    };
    return friend;
};