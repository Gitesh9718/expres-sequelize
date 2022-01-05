'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('awardMappings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      typeId: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {model: 'users', key: 'id'}
      },
      presenterId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {model: 'users', key: 'id'}
      },
      awardId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {model: 'awards', key: 'id'}
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('awardMappings');
  }
};