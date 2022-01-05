'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('postHashTags', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            postId: {
                type: Sequelize.BIGINT,
                references: {model: 'posts', key: 'id'},
                allowNull: false
            },
            hashTagId: {
                type: Sequelize.BIGINT,
                references: {model: 'hashTags', key: 'id'},
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
        return queryInterface.dropTable('postHashTags');
    }
};