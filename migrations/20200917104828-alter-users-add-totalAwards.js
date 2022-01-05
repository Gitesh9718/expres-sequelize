'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
     return Promise.all([
       queryInterface.addColumn('users', 'totalAwards', {
         type: Sequelize.BIGINT,
         allowNull: false,
         defaultValue: 0,
         after: "privateKey"
       })
     ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'totalAwards')
    ]);
  }
};
