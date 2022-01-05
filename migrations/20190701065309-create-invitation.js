'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('invitations', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            userMetaId: {
                type: Sequelize.BIGINT,
                references: {model: 'userMeta', key: 'id'},
                allowNull: false
            },
            userId: {
                type: Sequelize.BIGINT,
                references: {model: 'users', key: 'id'},
                allowNull: false
            },
            friendMetaId: {
                type: Sequelize.BIGINT,
                references: {model: 'userMeta', key: 'id'},
                allowNull: false
            },
            friendId: {
                type: Sequelize.BIGINT,
                references: {model: 'users', key: 'id'},
                allowNull: false
            },
            publicText: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            privateText: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            acceptedAt: {
                allowNull: true,
                type: Sequelize.DATE,
                defaultValue: null
            },
            rejectedAt: {
                allowNull: true,
                type: Sequelize.DATE,
                defaultValue: null
            },
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: null
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('invitations');
    }
};
