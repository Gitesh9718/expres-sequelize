'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('conversationMessages', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            conversationId: {
                type: Sequelize.BIGINT,
                references: {model: 'conversations', key: 'id'},
                allowNull: false
            },
            text: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            fileId: {
                type: Sequelize.BIGINT,
                references: {model: 'files', key: 'id'},
                allowNull: true
            },
            postId: {
                type: Sequelize.BIGINT,
                references: {model: 'posts', key: 'id'},
                allowNull: true
            },
            recommendUserId: {
                type: Sequelize.BIGINT,
                references: {model: 'users', key: 'id'},
                allowNull: true
            },
            userId: {
                type: Sequelize.BIGINT,
                references: {model: 'users', key: 'id'},
                allowNull: false
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
        return queryInterface.dropTable('conversationMessages');
    }
};
