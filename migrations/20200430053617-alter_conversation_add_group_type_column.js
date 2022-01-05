'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('conversations', 'groupType', {
            type: Sequelize.STRING,
            after: "type",
            allowNull: true
        });
    },

    down: (queryInterface, Sequelize) => {
      return queryInterface.removeColumn('conversations', 'groupType');
    }
};
