'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('invitations', 'isCleared', {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                after: "rejectedAt"
            }),
            queryInterface.addColumn('invitations', 'sendAt', {
                type: Sequelize.DATE,
                allowNull: true,
                after: "privateText"
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
      return Promise.all([
        queryInterface.removeColumn('invitations', 'isCleared'),
        queryInterface.removeColumn('invitations', 'sendAt'),
      ]);
    }
};
