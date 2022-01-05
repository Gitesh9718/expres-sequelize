'use strict';
module.exports = (sequelize, DataTypes) => {
    const report_post = sequelize.define('reportPost', {
        userId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'},
            allowNull: false
        },
        postId: {
            type: DataTypes.BIGINT,
            references: {model: 'posts', key: 'id'},
            allowNull: false
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        concernTo: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        paranoid: true
    });
    report_post.associate = function (models) {
        // associations can be defined here
    };
    return report_post;
};
