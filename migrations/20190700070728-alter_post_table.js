'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return new Promise(resolve => resolve());
      // return Promise.all([
      //     queryInterface.addColumn('Posts', 'type', {
      //         type: Sequelize.ENUM('REQUEST', 'POST'),
      //         defaultValue: 'REQUEST',
      //         after: "user_id",
      //         allowNull: false
      //     }),
      //     queryInterface.addColumn('Posts', 'description', {
      //         type: Sequelize.TEXT,
      //         after: "type",
      //         allowNull: true
      //     })
      // ]);
  },

  down: (queryInterface, Sequelize) => {
      // return Promise.all([
      //     queryInterface.removeColumn('Posts', 'type'),
      //     queryInterface.removeColumn('Posts', 'description')
      // ]);
  }
};
