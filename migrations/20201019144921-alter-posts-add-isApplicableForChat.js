'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
     return Promise.all([
        queryInterface.addColumn('posts', 'isApplicableForChat', {
          type: Sequelize.BOOLEAN,
          allowNull: false, 
          defaultValue: false,
          after: 'timing'
        })
     ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('posts', 'isApplicableForChat'),
  ]);
  }
};
