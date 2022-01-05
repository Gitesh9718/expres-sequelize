'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('users', 'totalLikes', {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        after: "totalAwards",
        allowNull: false,
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'totalLikes'),
    ]);
  }
};
