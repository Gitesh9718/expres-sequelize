'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('conversationMessages', 'replyId', {
                type: Sequelize.BIGINT,
                references: {model: 'conversationMessages', key: 'id'},
                after: "conversationId",
                allowNull: true,
            })
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('conversationMessages', 'replyId')
        ]);
    }
};
