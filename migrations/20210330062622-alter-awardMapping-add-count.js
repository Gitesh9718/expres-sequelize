'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('awardMappings', 'awardId', {
        type: Sequelize.BIGINT,
        allowNull: true,
      }),

      queryInterface.addColumn('awardMappings', 'count', {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 1,
        after: 'awardId'
      }),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('awardMappings', 'awardId', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),

      queryInterface.removeColumn('awardMappings', 'count')
    ])
  }
};
