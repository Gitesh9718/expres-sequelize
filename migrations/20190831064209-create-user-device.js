'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('userDevices', {
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
            uuid: {
                allowNull: true,
                type: Sequelize.STRING
            },
            token: {
                allowNull: true,
                type: Sequelize.STRING
            },
            type: {
                type: Sequelize.ENUM('IOS', 'ANDROID'),
                allowNull: false
            },
            version: {
                allowNull: true,
                type: Sequelize.STRING
            },
            model: {
                allowNull: true,
                type: Sequelize.STRING
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
        return queryInterface.dropTable('userDevices');
    }
};