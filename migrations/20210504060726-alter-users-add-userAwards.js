'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'userAwards', {
            type: Sequelize.BIGINT,
            defaultValue: 0,
            after: 'privateKey',
            allowNull: false
        });

        await queryInterface.removeColumn('users', 'totalLikes');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'userAwards');

        await queryInterface.addColumn('users', 'totalLikes', {
            type: Sequelize.BIGINT,
            defaultValue: 0,
            after: 'totalAwards',
            allowNull: false
        });
    }
};
