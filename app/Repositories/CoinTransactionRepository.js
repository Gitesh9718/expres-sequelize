'use strict'

const {coinTransaction} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    coinTransactionCreate: coinTransactionCreate,
    coinTransactionBulkCreate: coinTransactionBulkCreate,
    coinTransactionDetail: coinTransactionDetail,
    // coinTransactionUpdate: coinTransactionUpdate,
    coinTransactionList: coinTransactionList,
    coinTransactionDelete: coinTransactionDelete,
    coinTransactionCount: coinTransactionCount
};

async function coinTransactionCreate(data){
    return BaseRepo.baseCreate(coinTransaction, data);
}

async function coinTransactionBulkCreate(data){
    return BaseRepo.baseBulkCreate(coinTransaction, data);
}

async function coinTransactionDetail(params) {
    return BaseRepo.baseDetail(coinTransaction, params)
}

/*async function coinTransactionUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(coinTransaction, searchParams, data);
}*/

async function coinTransactionList(params) {
    return BaseRepo.baseList(coinTransaction, params)
}

async function coinTransactionDelete(searchParams) {
    return BaseRepo.baseDelete(coinTransaction, searchParams)
}

async function coinTransactionCount(searchParams) {
    return BaseRepo.baseCount(coinTransaction, searchParams)
}
