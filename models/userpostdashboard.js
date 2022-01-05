/* global _appConstant */
'use strict';

module.exports = (sequelize, DataTypes) => {
    const userPostDashboard = sequelize.define('userPostDashboard', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        type: {
            type: DataTypes.ENUM,
            values: [_appConstant.DASHBOARD_POST_COMMENTED, _appConstant.DASHBOARD_POST_REPOSTED, _appConstant.DASHBOARD_POST_FORWARDED, _appConstant.DASHBOARD_POST_BOOKMARKED, _appConstant.DASHBOARD_POST_AWARDED],
            allowNull: false
        },
        postId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: { model: 'posts', key: 'id' }
        },
        count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        timestamps: true,
        underscored: false
    });

    userPostDashboard.associate = function (models) {
        this.belongsTo(models.user);
        this.belongsTo(models.post);
    };

    return userPostDashboard;
};
