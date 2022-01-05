'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('friends', 'postCount', {
        type: Sequelize.BIGINT,
        after: "isFavorite",
        allowNull: false,
        defaultValue: 0
      }),

      queryInterface.addColumn('friends', 'lastPostAt', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        after: 'postCount'
      }),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('friends', 'postCount'),
      queryInterface.removeColumn('friends', 'lastPostAt')
    ])
  }
};
