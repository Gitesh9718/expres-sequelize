'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.addColumn('conversationUsers', 'role', {
              type: Sequelize.ENUM('ADMIN', 'USER'),
              after: "userId",
              defaultValue: 'USER',
              allowNull: false,
          }),
          queryInterface.addColumn('conversationUsers', 'muteOn', {
              type:  Sequelize.DATE,
              after: "role",
              defaultValue: null,
              allowNull: true,
          }),
          queryInterface.addColumn('conversationUsers', 'muteDuration', {
              type:  Sequelize.BIGINT.UNSIGNED,
              after: "muteOn",
              defaultValue: 0,
          }),
      ]);
  },

  down: (queryInterface, Sequelize) => {
      return Promise.all([
          queryInterface.removeColumn('conversationUsers', 'role'),
          queryInterface.removeColumn('conversationUsers', 'muteOn'),
          queryInterface.removeColumn('conversationUsers', 'muteDuration'),
      ]);
  }
};
