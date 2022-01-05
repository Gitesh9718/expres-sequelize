'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'educationDegree', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'fieldOfStudy'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'educationDegree');
    }
};
