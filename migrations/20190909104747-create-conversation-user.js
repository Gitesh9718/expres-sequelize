'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('conversationUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      conversationId: {
        type: Sequelize.BIGINT,
        references: {model: 'conversations', key: 'id'},
        allowNull: false
      },
      userId: {
        type: Sequelize.BIGINT,
        references: {model: 'users', key: 'id'},
        allowNull: false
      },
      unreadMessageCount: {
        type: Sequelize.STRING,
        allowNull: true
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('conversationUsers');
  }
};
