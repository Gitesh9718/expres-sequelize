'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('userPostDashboards', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            userId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: { model: 'users', key: 'id' }
            },
            type: {
                type: Sequelize.ENUM('POST_COMMENTED', 'POST_REPOSTED', 'POST_FORWARDED', 'POST_BOOKMARKED', 'POST_AWARDED'),
                allowNull: false
            },
            postId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: { model: 'posts', key: 'id' }
            },
            count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('userPostDashboards');
    }
};
