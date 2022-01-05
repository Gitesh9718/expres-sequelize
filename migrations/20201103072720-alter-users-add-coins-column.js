'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('users', 'coins', {
        type:  Sequelize.BIGINT.UNSIGNED,
        after: "totalAwards",
        defaultValue: 0,
        allowNull: false
      }),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'coins')
    ])
  }
};
