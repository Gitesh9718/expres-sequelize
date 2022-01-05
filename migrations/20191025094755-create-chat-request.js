'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('chatRequests', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.BIGINT,
                references: {model: 'users', key: 'id'},
                allowNull: false
            },
            requestedUserId: {
                type: Sequelize.BIGINT,
                references: {model: 'users', key: 'id'},
                allowNull: false
            },
            approverUserId: {
                type: Sequelize.BIGINT,
                references: {model: 'users', key: 'id'},
                allowNull: false
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            rejectReason: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
                defaultValue: 'PENDING',
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
        return queryInterface.dropTable('chatRequests');
    }
};
