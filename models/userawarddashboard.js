'use strict';

module.exports = (sequelize, DataTypes) => {
    const userAwardDashboard = sequelize.define('userAwardDashboard', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        receiverId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        awardCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        timestamps: true,
        underscored: false
    });

    userAwardDashboard.associate = function (models) {
        this.belongsTo(models.user, { foreignKey: 'receiverId' });
    };

    return userAwardDashboard;
};
