'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('users', 'email', {
                type: Sequelize.STRING(190),
                after: "id",
                allowNull: false
            }),

            queryInterface.addColumn('users', 'password', {
                type: Sequelize.STRING,
                after: "email",
                allowNull: false
            })
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('users', 'email'),
            queryInterface.removeColumn('users', 'password')
        ]);
    }
};
