'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('users', 'publicKey', {
                type: Sequelize.TEXT,
                after: "isDefault",
                allowNull: true,
            }),
            queryInterface.addColumn('users', 'privateKey', {
                type: Sequelize.TEXT,
                after: "publicKey",
                allowNull: true,
            }),
            queryInterface.addColumn('users', 'deletedAt', {
                type: Sequelize.DATE,
                after: "publicKey",
                allowNull: true,
                defaultValue: null,
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('users', 'publicKey'),
            queryInterface.removeColumn('users', 'privateKey'),
            queryInterface.removeColumn('users', 'deletedAt')
        ]);
    }
};
