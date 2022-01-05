const {TE, to}              = require('../services/util.service');

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('Friend', {
    userId   : {type: DataTypes.BIGINT, allowNull: false, primaryKey: true},
    friendId : {type: DataTypes.BIGINT, allowNull: false, primaryKey: true},
    favorite  : {type: DataTypes.DATE, allowNull: true},
    locked    : {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
  },
  {
    timestamps: true,
    omitNull: false,
    underscored: false,
    createdAt: 'creation_date',
    updatedAt: false
  });
  
  Model.associate = function(models){
    this.user = this.belongsTo(models.user, {foreignKey: 'friendId'});
  };

  Model.prototype.toWeb = function (pw) {
      let json = this.toJSON();
      return json;
  };

  return Model;
};