'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('invitations', 'name', {
        type:  Sequelize.STRING,
        after: "friendId",
        allowNull: true,
      }),
      queryInterface.addColumn('invitations', 'email', {
        type:  Sequelize.STRING,
        after: "name",
        allowNull: true,
      }),
      queryInterface.changeColumn('invitations', 'friendMetaId', {
        type:  Sequelize.BIGINT,
        allowNull: true,
      }),
      queryInterface.changeColumn('invitations', 'friendId', {
        type:  Sequelize.BIGINT,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('invitations', 'name'),
      queryInterface.removeColumn('invitations', 'email'),
      queryInterface.changeColumn('invitations', 'friendMetaId', {
        type:  Sequelize.BIGINT,
        allowNull: false,
      }),
      queryInterface.changeColumn('invitations', 'friendId', {
        type:  Sequelize.BIGINT,
        allowNull: false,
      })
    ]);
  }
};
