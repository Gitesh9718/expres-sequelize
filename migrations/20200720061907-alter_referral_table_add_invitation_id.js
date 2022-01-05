'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('referrals', 'invitationId', {
                type: Sequelize.BIGINT,
                references: {model: 'invitations', key: 'id'},
                allowNull: true,
                after: "id"
            }),
            queryInterface.addColumn('referrals', 'expiredAt', {
                type: Sequelize.DATE,
                allowNull: true,
                after: "code"
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('referrals', 'invitationId'),
            queryInterface.removeColumn('referrals', 'expiredAt'),
        ]);
    }
};
