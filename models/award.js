'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    const award = sequelize.define('award', {
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            type: {
                type: DataTypes.ENUM,
                values: ['USER', 'COMMENT', 'POST'],
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },

        },
        {
            timestamps: true,
            paranoid: true
        }
    );

    award.associate = function (models) {
        this.hasMany(models.awardMapping, {foreignKey: 'awardId', sourceKey: 'id'});
        this.belongsToMany(models.user, {
            through: models.awardMapping, foreignKey: 'awardId',
            otherKey: 'userId'
        });
    };

    return award;
};
