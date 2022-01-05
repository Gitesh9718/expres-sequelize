const {TE, to}              = require('../services/util.service');

//status:
// 0 - show invitation
// 1 - wait for user approval

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('Invitation', {
    id        : {type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true},
    user_id   : {type: DataTypes.BIGINT, allowNull: false},
    friend_id : {type: DataTypes.BIGINT, allowNull: false},
    status    : {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    status_user:{type: DataTypes.BIGINT, allowNull: true},
    public_text:{type: DataTypes.TEXT, allowNull: true}
  },
  {
    timestamps: true,
    underscored: true,
    createdAt: 'creation_date',
    updatedAt: false
  });
  
  Model.associate = function(models){
    this.user = this.belongsTo(models.user, {as: 'user'});
    this.user = this.belongsTo(models.user, {as: 'friend'});
  };

  Model.prototype.toWeb = function (pw) {
      let json = this.toJSON();
      return json;
  };

  return Model;
};