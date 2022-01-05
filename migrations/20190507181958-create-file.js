'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('files', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            key: {
                type: Sequelize.STRING,
                allowNull: false
            },
            type: {
                type: Sequelize.ENUM('USER_IMAGE', 'POST_IMAGE', 'BUG_IMAGE', 'CHAT_IMAGE', 'CHAT_VIDEO', 'CHAT_DOCUMENT', 'CHAT_AUDIO', 'POST_AUDIO'),
                allowNull: false
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
        return queryInterface.dropTable('files');
    }
};