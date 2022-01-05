'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('posts', 'totalAwards', {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
        after: "numberOfForwards"
      }),

      queryInterface.addColumn('posts', 'totalComments', {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
        after: "totalAwards"
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
     return Promise.all([
         queryInterface.removeColumn('posts', 'totalAwards'),
         queryInterface.removeColumn('posts', 'totalComments')
     ]);
  }
};
