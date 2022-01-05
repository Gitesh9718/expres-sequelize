'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
        queryInterface.addColumn('posts', 'forwardedCount', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'totalComments'
        }),
        
        queryInterface.addColumn('posts', 'bookmarkedCount', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'forwardedCount'
        }),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('posts', 'forwardedCount'),
      queryInterface.removeColumn('posts', 'bookmarkedCount'),
    ])
  }
};
