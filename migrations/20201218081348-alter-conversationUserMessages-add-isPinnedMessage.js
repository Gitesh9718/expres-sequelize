'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('conversationUserMessages', 'isPinnedMessage', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        after: 'conversationMessageId',
        defaultValue: false
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('conversationUserMessages', 'isPinnedMessage')
    ])
  }
};
