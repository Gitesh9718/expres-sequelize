'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('connections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      userMetaId: {
        type: Sequelize.BIGINT,
        references: {model: 'userMeta', key: 'id'},
        allowNull: false
      },
      userId: {
        type: Sequelize.BIGINT,
        references: {model: 'users', key: 'id'},
        allowNull: false
      },
      friendMetaId: {
        type: Sequelize.BIGINT,
        references: {model: 'userMeta', key: 'id'},
        allowNull: false
      },
      friendId: {
        type: Sequelize.BIGINT,
        references: {model: 'users', key: 'id'},
        allowNull: false
      },
      degree: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      isFavorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    return queryInterface.dropTable('connections');
  }
};
