const {TE, to} = require('../services/util.service');
const _ = require('lodash');

module.exports = (sequelize, DataTypes) => {
    let Model = sequelize.define('Post', {
            id: {type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true},
            parent_id: {type: DataTypes.BIGINT, allowNull: true, defaultValue: null},
            user_id: {type: DataTypes.BIGINT, allowNull: false},
            type: {type: DataTypes.ENUM, values: ['REQUEST', 'POST'], defaultValue: 'REQUEST'},
            description: {type: DataTypes.TEXT, allowNull: true},
            intention: {type: DataTypes.TEXT, allowNull: true},
            desired_output: {type: DataTypes.TEXT, allowNull: true},
            agenda: {type: DataTypes.TEXT, allowNull: true},
            rules: {type: DataTypes.TEXT, allowNull: true},
            roles: {type: DataTypes.TEXT, allowNull: true},
            timing: {type: DataTypes.TEXT, allowNull: true},
            link: {type: DataTypes.TEXT, allowNull: true},
            number_of_forwards: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
        },
        {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: false
        });

    Model.associate = function (models) {
        this.post = this.belongsTo(models.Post, {as: 'ParentPost', foreignKey: 'parent_id'});
        this.user = this.belongsTo(models.user);
        this.hashTag = this.belongsToMany(models.hashTag, {
            through: models.postHashTag, foreignKey: 'postId',
            otherKey: 'hashTagId'
        });
    };

    Model.prototype.toWeb = function (pw) {
        let json = this.toJSON();
        return _.omitBy(json, _.isNil);
    };

    return Model;
};