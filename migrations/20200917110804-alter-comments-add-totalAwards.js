'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
     return Promise.all([
       queryInterface.addColumn('comments', 'totalAwards', {
         type: Sequelize.BIGINT,
         allowNull: false,
         after: "text",
         defaultValue: 0
       })
     ])
  },

  down: (queryInterface, Sequelize) => {
     return Promise.all([
       queryInterface.removeColumn('comments', 'totalAwards')
     ]);
  }
};
