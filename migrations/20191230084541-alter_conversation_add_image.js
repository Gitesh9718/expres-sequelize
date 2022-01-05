'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('conversations', 'imageId', {
                type: Sequelize.BIGINT,
                references: {model: 'files', key: 'id'},
                after: "type",
                allowNull: true,
            }),
            queryInterface.addColumn('conversations', 'description', {
                type: Sequelize.TEXT,
                after: "name",
                allowNull: true,
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('conversations', 'imageId'),
            queryInterface.removeColumn('conversations', 'description')
        ]);
    }
};
