'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return Promise.all([
        queryInterface.changeColumn('notifications', 'text', {
          type: Sequelize.TEXT
        })
      ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('notifications', 'text', {
        type: Sequelize.STRING
      })
    ]);
  }
};
