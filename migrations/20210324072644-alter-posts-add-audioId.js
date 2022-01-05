'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('posts', 'audioId', {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {model: 'files', key: 'id'},
        after: 'fileId'
       })
      ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('posts', 'audioId'),
    ]);
  }
};
