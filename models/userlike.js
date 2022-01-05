'use strict';

module.exports = (sequelize, DataTypes) => {
  const userLike = sequelize.define('userLike', {
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
    likedUserId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {model: 'users', key: 'id'}
    }
  }, {
    timestamps: true,
    underscored: false,
    paranoid: true,
  });

  userLike.associate = function (models) {
    this.belongsTo(models.user);
    this.belongsTo(models.user, {as: 'likedUser', foreignKey: 'likedUserId'});
  };

  return userLike;
};
