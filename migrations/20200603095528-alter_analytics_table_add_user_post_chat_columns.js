'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('analytics', 'activeUsers', {
                type: Sequelize.BIGINT,
                allowNull: false,
                defaultValue: 0,
                after: "users"
            }),
            queryInterface.addColumn('analytics', 'totalPosts', {
                type: Sequelize.BIGINT,
                allowNull: false,
                defaultValue: 0,
                after: "newUsers"
            }),
            queryInterface.addColumn('analytics', 'requestPosts', {
                type: Sequelize.BIGINT,
                allowNull: false,
                defaultValue: 0,
                after: "posts"
            }),
            queryInterface.addColumn('analytics', 'introduceGroups', {
                type: Sequelize.BIGINT,
                allowNull: false,
                defaultValue: 0,
                after: "groups"
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('analytics', 'activeUsers'),
            queryInterface.removeColumn('analytics', 'totalPosts'),
            queryInterface.removeColumn('analytics', 'requestPosts'),
            queryInterface.removeColumn('analytics', 'introduceGroups'),
        ]);
    }
};
