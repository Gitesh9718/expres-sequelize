'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
     return Promise.all([
        queryInterface.addColumn('posts', 'forwardToConvoType', {
          type: Sequelize.ENUM("SINGLE", "GROUP"),
          allowNull: true, 
          defaultValue: null,
          after: 'isApplicableForChat'
        })
     ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('posts', 'forwardToConvoType'),
  ]);
  }
};
