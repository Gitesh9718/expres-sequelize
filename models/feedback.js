'use strict';
module.exports = (sequelize, DataTypes) => {
    const Feedback = sequelize.define('feedback', {
        id: {type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true},
        type: {
            type: DataTypes.ENUM,
            values: ['FEEDBACK', 'BUG']
        },
        userId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'}
        },
        text: DataTypes.TEXT,
        fileId: {
            type: DataTypes.BIGINT,
            references: {model: 'files', key: 'id'}
        },
    }, {
        tableName: 'feedback'
    });
    Feedback.associate = function (models) {
        // associations can be defined here
    };
    return Feedback;
};
