'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('posts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            userId: {
                type: Sequelize.BIGINT,
                references: {model: 'users', key: 'id'},
                allowNull: false
            },
            parentId: {
                type: Sequelize.BIGINT,
                allowNull: true,
                references: {model: 'posts', key: 'id'}
            },
            type: {
                type: Sequelize.ENUM('REQUEST', 'POST'),
                defaultValue: 'REQUEST',
                allowNull: false
            },
            title: {
                type: Sequelize.STRING,
                allowNull: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            fileId: {
                type: Sequelize.BIGINT,
                allowNull: true,
                references: {model: 'files', key: 'id'}
            },
            intention: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            link: {
                type: Sequelize.STRING,
                allowNull: true
            },
            desiredOutput: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            agenda: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            rules: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            timing: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            numberOfForwards: {
                type: Sequelize.INTEGER,
                defaultValue: 0
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
        return queryInterface.dropTable('posts');
    }
};