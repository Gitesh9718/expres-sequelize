const { TE, to } = require('../services/util.service');

module.exports = (sequelize, DataTypes) =>
{
  var Model = sequelize.define('NewUserInvitation', {
    id      : { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
    user_id : { type: DataTypes.BIGINT, allowNull: false },
    email   : { type: DataTypes.STRING(190), allowNull: false, unique: true, validate: { isEmail: { msg: "Email is invalid." } } },
    public_text: { type: DataTypes.TEXT, allowNull: true}
  },
  {
    timestamps: true,
    underscored: true,
    createdAt: 'creation_date',
    updatedAt: false
  });

  Model.associate = function (models)
  {
    //this.user = this.belongsTo(models.user);
  };

  Model.prototype.toWeb = function (pw)
  {
    let json = this.toJSON();
    return json;
  };

  return Model;
};