'use strict';

module.exports = (sequelize, DataTypes) => {
    const userNetworkAward = sequelize.define('userNetworkAward', {
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
        awardCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        timestamps: true,
        underscored: false
    });

    userNetworkAward.associate = function (models) {
        this.belongsTo(models.user);
    };

    return userNetworkAward;
};
