'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('analytics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      users: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      newUsers: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      posts: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      postForwards: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      comments: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      bilateralChats: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      groups: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
      },
      sessionTimeSpent: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
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
    return queryInterface.dropTable('analytics');
  }
};
