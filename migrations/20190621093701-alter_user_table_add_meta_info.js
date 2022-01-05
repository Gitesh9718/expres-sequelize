'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('users', 'userMetaId', {
                type: Sequelize.BIGINT,
                after: "id",
                allowNull: true,
                references: {model: 'userMeta', key: 'id'}
            }),
            queryInterface.addColumn('users', 'isDefault', {
                type: Sequelize.BOOLEAN,
                after: "education",
                defaultValue: false
            })
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('users', 'userMetaId'),
            queryInterface.removeColumn('users', 'isDefault'),
        ]);
    }
};
