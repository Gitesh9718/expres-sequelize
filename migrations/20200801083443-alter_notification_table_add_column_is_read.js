'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('notifications', 'isRead', {
                type: Sequelize.BOOLEAN,
                after: "text",
                allowNull: false,
                defaultValue: false
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('notifications', 'isRead'),
        ]);
    }
};
