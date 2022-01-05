'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('comments', 'isBestAnswer', {
        type: Sequelize.BOOLEAN,
        after: "text",
        defaultValue: false,
        allowNull: false,
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('comments', 'isBestAnswer')
    ]);
  }
};
