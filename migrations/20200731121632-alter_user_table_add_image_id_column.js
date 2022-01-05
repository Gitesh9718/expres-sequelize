'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('users', 'imageId', {
                type: Sequelize.BIGINT,
                after: "image",
                references: {model: 'files', key: 'id'},
                allowNull: true
            }),
            queryInterface.addColumn('users', 'unReadNotificationCount', {
                type: Sequelize.BIGINT,
                allowNull: false,
                after: "privateKey",
                defaultValue: 0
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('users', 'imageId'),
            queryInterface.removeColumn('users', 'unReadNotificationCount'),
        ]);
    }
};
