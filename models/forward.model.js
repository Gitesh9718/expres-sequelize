const {TE, to}              = require('../services/util.service');

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('Forward', {
    forwarder_id : {type: DataTypes.BIGINT, allowNull: false, primaryKey: true},
    previous_id  : {type: DataTypes.BIGINT, allowNull: true},
    post_id      : {type: DataTypes.BIGINT, allowNull: false, primaryKey: true},
    number_of_forwards : {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
  },
  {
    timestamps: true,
    underscored: true,
    createdAt: 'creation_date',
    updatedAt: false
  });
  
  Model.associate = function(models){
  //  this.user = this.belongsTo(models.user, { foreignKey: 'forwarder_id', allowNull: false });
  };

  Model.prototype.toWeb = function (pw) {
      let json = this.toJSON();
      return json;
  };

  return Model;
};