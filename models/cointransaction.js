'use strict';

module.exports = (sequelize, DataTypes) => {
    const coinTransaction = sequelize.define('coinTransaction', {
        id: {
          type: DataTypes.BIGINT, 
          allowNull: false, 
          primaryKey: true, 
          autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            references: {model: 'users', key: 'id'}
        },
        type: {
            type: DataTypes.ENUM,
            values: [
              _appConstant.COINS_TRANSACTION_TYPE_REGISTERATION, _appConstant.COINS_TRANSACTION_TYPE_PROFILE_PIC_UPLOAD,
              _appConstant.COINS_TRANSACTION_TYPE_INVITATION_ACCEPT, _appConstant.COINS_TRANSACTION_TYPE_FRIEND_INVITATION_ACCEPT,
              _appConstant.COINS_TRANSACTION_TYPE_INTRODUCE, _appConstant.COINS_TRANSACTION_TYPE_AWARD_USER,
              _appConstant.COINS_TRANSACTION_TYPE_AWARD_POST, _appConstant.COINS_TRANSACTION_TYPE_AWARD_COMMENT
            ]
        },
        typeId: {
            type: DataTypes.BIGINT, 
            allowNull: true,
            defaultValue: null
        },
        coins: {
            type: DataTypes.BIGINT, 
            allowNull: false,
        },
    }, {
        timestamps: true,
        paranoid: true,
    });

    coinTransaction.associate = function (models) {
        this.belongsTo(models.user);
    };
    return coinTransaction;
};
