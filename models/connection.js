'use strict';
module.exports = (sequelize, DataTypes) => {
    const connection = sequelize.define('connection', {
        id: {
            allowNull: false, autoIncrement: true,
            primaryKey: true, type: DataTypes.BIGINT
        },
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
        degree: {type: DataTypes.INTEGER.UNSIGNED, allowNull: false},
        isFavorite: {type: DataTypes.BOOLEAN, defaultValue: false}
    }, {});
    connection.associate = function (models) {
        // associations can be defined here
    };
    return connection;
};
