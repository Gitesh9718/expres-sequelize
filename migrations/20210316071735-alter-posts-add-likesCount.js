'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('posts', 'likesCount', {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        after: "repostedCount",
        allowNull: false,
       })
      ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('posts', 'likesCount'),
    ]);
  }
};
