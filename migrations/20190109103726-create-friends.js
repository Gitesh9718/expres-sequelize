'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Friends', {
            userId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            friendId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            favorite: {type: Sequelize.DATE, allowNull: true, defaultValue: null},
            locked: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
            creation_date: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Friends');
    }
};