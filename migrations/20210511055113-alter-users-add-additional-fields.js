'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'expertise', {
            type: Sequelize.STRING(500),
            allowNull: true,
            after: 'position'
        });

        await queryInterface.addColumn('users', 'interests', {
            type: Sequelize.STRING(500),
            allowNull: true,
            after: 'website'
        });

        await queryInterface.addColumn('users', 'sideProjects', {
            type: Sequelize.STRING(500),
            allowNull: true,
            after: 'interests'
        });

        await queryInterface.addColumn('users', 'askMeAbout', {
            type: Sequelize.STRING(500),
            allowNull: true,
            after: 'sideProjects'
        });

        await queryInterface.addColumn('users', 'lookingFor', {
            type: Sequelize.STRING(500),
            allowNull: true,
            after: 'askMeAbout'
        });

        await queryInterface.addColumn('users', 'quoteILike', {
            type: Sequelize.STRING(500),
            allowNull: true,
            after: 'lookingFor'
        });

        await queryInterface.addColumn('users', 'artOrMusicILike', {
            type: Sequelize.STRING(500),
            allowNull: true,
            after: 'quoteILike'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'expertise');
        await queryInterface.removeColumn('users', 'interests');
        await queryInterface.removeColumn('users', 'sideProjects');
        await queryInterface.removeColumn('users', 'askMeAbout');
        await queryInterface.removeColumn('users', 'lookingFor');
        await queryInterface.removeColumn('users', 'quoteILike');
        await queryInterface.removeColumn('users', 'artOrMusicILike');
    }
};
