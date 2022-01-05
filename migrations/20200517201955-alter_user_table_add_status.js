'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'status', {
      type: Sequelize.ENUM('ACTIVE', 'DE_ACTIVATE', 'BLOCK'),
      after: "image",
      allowNull: false,
      defaultValue: 'ACTIVE'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'status');
  }
};
