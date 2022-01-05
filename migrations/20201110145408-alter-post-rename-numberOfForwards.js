'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
        queryInterface.renameColumn('posts', 'numberOfForwards', 'repostedCount')
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn('posts', 'repostedCount', 'numberOfForwards'),
    ])
  }
};
