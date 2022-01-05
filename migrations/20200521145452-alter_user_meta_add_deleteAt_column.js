'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('userMeta', 'deletedAt', {
                type: Sequelize.DATE,
                after: "password",
                allowNull: true,
                defaultValue: null,
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
      return Promise.all([
        queryInterface.removeColumn('userMeta', 'deletedAt')
      ]);
    }
};
