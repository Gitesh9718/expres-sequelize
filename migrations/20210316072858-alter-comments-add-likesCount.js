'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('comments', 'likesCount', {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        after: "isBestAnswer",
        allowNull: false,
       })
      ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('comments', 'likesCount'),
    ]);
  }
};
