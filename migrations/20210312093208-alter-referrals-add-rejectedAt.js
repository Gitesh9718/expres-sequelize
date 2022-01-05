'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('referrals', 'rejectedAt', {
                type: Sequelize.DATE,
                allowNull: true,
                after: "usedAt"
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('referrals', 'rejectedAt'),
        ]);
    }
};
