'use strict';

module.exports = (sequelize, DataTypes) => {
  const block = sequelize.define('block', {
    id: {
      allowNull: false, autoIncrement: true,
      primaryKey: true, type: DataTypes.BIGINT
    },
    userId: {
      type: DataTypes.BIGINT, 
      allowNull: false,
      references: {model: 'users', key: 'id'}
    },
    blockedUserId: {
      type: DataTypes.BIGINT, 
      allowNull: false,
      references: {model: 'users', key: 'id'}
    }
  }, 
  {
    timestamps: true,
    paranoid: true
  });

  block.associate = function (models) {
    this.belongsTo(models.user, {foreignKey: 'blockedUserId'})
  };
  return block;
};