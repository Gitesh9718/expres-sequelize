'use strict';
module.exports = (sequelize, DataTypes) => {
  var Profile = sequelize.define('profile', {
    id: {type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true},
    user_id: {
      type: DataTypes.BIGINT,
      references: {model: 'users', key: 'id'}
    },
    company: DataTypes.STRING,
    position: DataTypes.STRING,
    education: DataTypes.STRING,
  }, {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  });

  return Profile;
};