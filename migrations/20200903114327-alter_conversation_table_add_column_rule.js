'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('conversations', 'rule', {
            type: Sequelize.TEXT,
            after: "description",
            allowNull: true
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('conversations', 'rule');
    }
};
