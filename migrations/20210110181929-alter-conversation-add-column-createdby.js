'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('conversations', 'createdBy', {
        type: Sequelize.BIGINT,
        references: {model: 'users', key: 'id'},
        allowNull: true,
        after: 'lastMessageId',
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('conversations', 'createdBy')
    ]);
  }
};
