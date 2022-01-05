'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('posts', 'isBlocked', {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                after: "numberOfForwards",
                allowNull: false,
            }),
            queryInterface.addColumn('posts', 'updatedBy', {
                type: Sequelize.BIGINT,
                references: {model: 'users', key: 'id'},
                after: "isBlocked",
                allowNull: true,
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('posts', 'isBlocked'),
            queryInterface.removeColumn('posts', 'updatedBy'),
        ]);
    }
};
