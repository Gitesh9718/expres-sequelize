'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('reportUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      userId: {
        type: Sequelize.BIGINT,
        references: {model: 'users', key: 'id'},
        allowNull: false
      },
      reportedUserId: {
        type: Sequelize.BIGINT,
        references: {model: 'users', key: 'id'},
        allowNull: false
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      concernTo: {
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
    return queryInterface.dropTable('reportUsers');
  }
};
