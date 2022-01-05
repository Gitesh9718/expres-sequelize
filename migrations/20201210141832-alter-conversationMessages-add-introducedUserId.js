'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('conversationMessages', 'introducedUserId', {
        type: Sequelize.BIGINT,
        allowNull: true,
        after: 'recommendUserId',
        references: {model: 'users', key: 'id'}
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('conversationMessages', 'introducedUserId')
    ])
  }
};
