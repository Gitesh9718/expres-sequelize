'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('feedback', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            type: {
                type: Sequelize.ENUM('FEEDBACK', 'BUG'),
                defaultValue: 'FEEDBACK',
                allowNull: false
            },
            userId: {
                type: Sequelize.BIGINT,
                references: {model: 'users', key: 'id'},
                allowNull: false
            },
            text: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            fileId: {
                type: Sequelize.BIGINT,
                references: {model: 'files', key: 'id'},
                allowNull: true
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
        return queryInterface.dropTable('feedback');
    }
};