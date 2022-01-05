'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    const userAnalytic = sequelize.define('userAnalytic', {
            id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
               type: DataTypes.BIGINT,
               allowNull: false,
               references: {model: 'users', key: 'id'}
            },
            awards: {
              type: DataTypes.BIGINT, 
              allowNull:false, 
              defaultValue:0
            },
            activity: {
              type: DataTypes.BIGINT, 
              allowNull:false, 
              defaultValue:0
            },
            average: {
              type: DataTypes.ENUM,
              values: ['ABOVE', 'AVERAGE', 'EXCELLENT'],
              allowNull: false,
              defaultValue: 'AVERAGE'
            },
            trusted: {
              type: DataTypes.BIGINT, 
              allowNull:false, 
              defaultValue:0
            },
            featured: {
              type: DataTypes.BIGINT, 
              allowNull:false, 
              defaultValue:0
            },
            introduced: {
              type: DataTypes.BIGINT, 
              allowNull:false, 
              defaultValue:0
            },
            reposted: {
              type: DataTypes.BIGINT, 
              allowNull:false, 
              defaultValue:0
            },
            forwarded: {
              type: DataTypes.BIGINT, 
              allowNull:false, 
              defaultValue:0
            },
            bookmarked: {
              type: DataTypes.BIGINT, 
              allowNull:false, 
              defaultValue:0
            }

        },
        {
            timestamps: true,
            paranoid: true
        }
    );

    userAnalytic.associate = function (models) {
       // associations can be defined here
    };

    return userAnalytic;
};

 