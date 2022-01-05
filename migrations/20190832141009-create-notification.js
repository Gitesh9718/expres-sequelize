/* global _appConstant */

'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('notifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            type: {
                type: Sequelize.ENUM('COMMENT', 'COMMENT_REPLY', 'FORWARD', _appConstant.NOTIFICATION_TYPE_BOOKMARK, 'INVITATION', 'MESSAGE', 'FEATURE', _appConstant.NOTIFICATION_TYPE_AWARD_COMMENT, _appConstant.NOTIFICATION_TYPE_AWARD_POST, _appConstant.NOTIFICATION_TYPE_AWARD_USER),
                defaultValue: 'COMMENT',
                allowNull: false
            },
            typeId: {
                allowNull: true,
                type: Sequelize.BIGINT
            },
            postId: {
                type: Sequelize.BIGINT,
                references: { model: 'posts', key: 'id' },
                allowNull: true
            },
            actionOwnerId: {
                type: Sequelize.BIGINT,
                references: { model: 'users', key: 'id' },
                allowNull: false
            },
            userId: {
                type: Sequelize.BIGINT,
                references: { model: 'users', key: 'id' },
                allowNull: false
            },
            text: {
                allowNull: true,
                type: Sequelize.STRING
            },
            isSend: {
                type: Sequelize.BOOLEAN,
                default: false
            },
            deletedAt: {
                allowNull: true,
                type: Sequelize.DATE,
                defaultValue: null
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('notifications');
    }
};
