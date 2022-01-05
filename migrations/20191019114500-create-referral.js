'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('referrals', {
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
            email: {
                type: Sequelize.STRING,
                allowNull: true
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false
            },
            usedAt: {
                type: Sequelize.DATE,
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
        return queryInterface.dropTable('referrals');
    }
};
