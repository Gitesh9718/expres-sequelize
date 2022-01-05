'use strict';

module.exports = (sequelize, DataTypes) => {
    const postHashTag = sequelize.define('postHashTag', {
        id: {type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true},
        postId: {
            type: DataTypes.BIGINT, allowNull: false,
            references: {model: 'posts', key: 'id'}
        },
        hashTagId: {
            type: DataTypes.BIGINT, allowNull: false,
            references: {model: 'hashTags', key: 'id'}
        },
    }, {});

    postHashTag.associate = function (models) {
        // associations can be defined here
    };

    return postHashTag;
};