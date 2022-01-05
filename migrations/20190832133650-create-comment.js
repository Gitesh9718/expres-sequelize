'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('comments', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            parentId: {
                type: Sequelize.BIGINT,
                allowNull: true,
                references: {model: 'comments', key: 'id'}
            },
            postId: {
                type: Sequelize.BIGINT,
                references: {model: 'posts', key: 'id'},
                allowNull: false
            },
            userId: {
                type: Sequelize.BIGINT,
                references: {model: 'users', key: 'id'},
                allowNull: false
            },
            text: {
                type: Sequelize.STRING,
                allowNull: false,
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
        return queryInterface.dropTable('comments');
    }
};