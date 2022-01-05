'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('users', 'country', {
        type: Sequelize.STRING,
        after: "city",
        allowNull: true,
      }),
      queryInterface.addColumn('users', 'fieldOfStudy', {
        type: Sequelize.STRING,
        after: "education",
        allowNull: true,
      }),
      queryInterface.addColumn('users', 'school', {
        type: Sequelize.STRING,
        after: "fieldOfStudy",
        allowNull: true,
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'country'),
      queryInterface.removeColumn('users', 'fieldOfStudy'),
      queryInterface.removeColumn('users', 'school')
    ]);
  }
};
