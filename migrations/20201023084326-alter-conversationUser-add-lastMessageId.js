'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('conversationUsers', 'lastMessageId', {
          type: Sequelize.BIGINT,
          references: {model: 'conversationMessages', key: 'id'},
          after: "role",
          allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('conversationUsers', 'lastMessageId')
    ]);
  }
};
