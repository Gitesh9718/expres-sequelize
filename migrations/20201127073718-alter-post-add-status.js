'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('posts', 'status', {
        type: Sequelize.ENUM(_appConstant.POST_STATUS_OPEN, _appConstant.POST_STATUS_CLOSED),
        defaultValue: _appConstant.POST_STATUS_OPEN,
        after: "link",
        allowNull: false,
       })
      ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('posts', 'status'),
    ]);
  }
};
