'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('conversations', 'lastMessageId', {
                type: Sequelize.BIGINT,
                references: {model: 'conversationMessages', key: 'id'},
                after: "type",
                allowNull: true,
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('conversations', 'lastMessageId')
        ]);
    }
};
