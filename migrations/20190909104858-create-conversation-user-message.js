'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('conversationUserMessages', {
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
      conversationMessageId: {
        type: Sequelize.BIGINT,
        references: {model: 'conversationMessages', key: 'id'},
        allowNull: false
      },
      userId: {
        type: Sequelize.BIGINT,
        references: {model: 'users', key: 'id'},
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('SENT', 'DELIVERED','READ'),
        defaultValue: 'SENT',
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
    return queryInterface.dropTable('conversationUserMessages');
  }
};
