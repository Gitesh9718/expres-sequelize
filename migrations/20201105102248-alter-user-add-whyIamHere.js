'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('users', 'whyIamHere', {
        type:  Sequelize.STRING(500),
        after: "socialLinks",
        allowNull: true
      }),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'whyIamHere')
    ])
  }
};
