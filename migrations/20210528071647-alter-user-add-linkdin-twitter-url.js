'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'linkedinUrl', {
            type: Sequelize.STRING(500),
            allowNull: true,
            after: 'school'
        });

        await queryInterface.addColumn('users', 'twitterUrl', {
            type: Sequelize.STRING(500),
            allowNull: true,
            after: 'linkedinUrl'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'linkedinUrl');
        await queryInterface.removeColumn('users', 'twitterUrl');
    }
};
