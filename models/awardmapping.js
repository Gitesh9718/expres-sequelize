'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const awardMapping = sequelize.define('awardMapping', {
    id: {
      type: DataTypes.BIGINT, 
      allowNull: false, 
      primaryKey: true, 
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    typeId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      references: {model: 'users', key: 'id'},
      allowNull: false
    },
    presenterId: {
      type: DataTypes.BIGINT,
      references: { model: 'users', key: 'id'},
      allowNull: false
    },
    awardId: {
      type: DataTypes.BIGINT,
      references: { model: 'awards', key: 'id' },
      allowNull: true
    },
    count: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 1,
    }

  },
    {
      timestamps: true,
      paranoid: true
    }
  );

  awardMapping.associate = function (models) {
    this.belongsTo(models.user, {as: 'awardedUser', foreignKey: 'userId'});
    this.belongsTo(models.user, {as: 'presentingUser', foreignKey: 'presenterId'});
    this.belongsTo(models.award, {foreignKey: 'awardId'});
   };

  return awardMapping;
};