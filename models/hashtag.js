'use strict';
module.exports = (sequelize, DataTypes) => {
    const hashTag = sequelize.define('hashTag', {
        id: {type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true},
        name: {type: DataTypes.STRING, allowNull: false}
    }, {});
    hashTag.associate = function (models) {
        // associations can be defined here
    };
    return hashTag;
};