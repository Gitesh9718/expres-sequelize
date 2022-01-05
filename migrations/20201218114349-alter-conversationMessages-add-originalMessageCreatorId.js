'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('conversationMessages', 'originalMessageCreatorId', {
        type: Sequelize.BIGINT,
        references: {model: 'users', key: 'id'},
        allowNull: true,
        after: 'userId',
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('conversationMessages', 'originalMessageCreatorId')
    ])
  }
};
