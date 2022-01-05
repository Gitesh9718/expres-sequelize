'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
          type: Sequelize.STRING(190),
          allowNull: false,
      },
      image: {
        type: Sequelize.TEXT('long')
      },
      city: {
        type: Sequelize.STRING
      },
      company: {
        type: Sequelize.STRING
      },
      position: {
        type: Sequelize.STRING
      },
      about: {
        type: Sequelize.TEXT
      },
      education: {
        type: Sequelize.TEXT
      },
      password: {
        type: Sequelize.STRING,
      },
      last_seen_post: {
        type: Sequelize.BIGINT
      },
     creation_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      last_modified: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};