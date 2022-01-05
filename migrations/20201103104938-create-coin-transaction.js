'use strict';
const _appConstant = require('../app/Constants/constant');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('coinTransactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {model: 'users', key: 'id'}
      },
      type: {
        type: Sequelize.ENUM(_appConstant.COINS_TRANSACTION_TYPE_REGISTERATION, _appConstant.COINS_TRANSACTION_TYPE_PROFILE_PIC_UPLOAD, _appConstant.COINS_TRANSACTION_TYPE_INVITATION_ACCEPT, _appConstant.COINS_TRANSACTION_TYPE_INTRODUCE, _appConstant.COINS_TRANSACTION_TYPE_AWARD_USER, _appConstant.COINS_TRANSACTION_TYPE_AWARD_POST, _appConstant.COINS_TRANSACTION_TYPE_AWARD_COMMENT),
        allowNull: false
      },
      typeId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        defaultValue: null
      },
      coins: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      deletedAt:{
       type: Sequelize.DATE,
       allowNull: true,
       defaultValue: null 
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('coinTransactions');
  }
};