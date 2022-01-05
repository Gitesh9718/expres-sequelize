'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return new Promise(resolve => resolve());
        // return Promise.all([
        //     // queryInterface.removeColumn('users', 'email'),
        //     queryInterface.removeColumn('users', 'password'),
        //     queryInterface.addColumn('users', 'email', {
        //         type: Sequelize.STRING,
        //         after: "education",
        //         defaultValue: false
        //     }),
        // ]);
    },

    down: (queryInterface, Sequelize) => {
        // return Promise.all([
        //     queryInterface.addColumn('users', 'email', {
        //         type: Sequelize.STRING,
        //         after: "name",
        //         defaultValue: false
        //     }),
        //     queryInterface.addColumn('users', 'password', {
        //         type: Sequelize.STRING,
        //         after: "email",
        //         defaultValue: false
        //     })
        // ]);
    }
};
