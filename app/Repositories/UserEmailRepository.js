'use strict';

const {userEmail} = require('models/index');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    userEmailCreate: userEmailCreate,
    userEmailBulkCreate: userEmailBulkCreate,
    userEmailDetail: userEmailDetail,
    userEmailUpdate: userEmailUpdate,
    userEmailList: userEmailList,
    userEmailCount: userEmailCount,
    userEmailDelete: userEmailDelete,
    userEmailRestore: userEmailRestore
};

async function userEmailCreate(data) {
    return BaseRepo.baseCreate(userEmail, data);
}

async function userEmailBulkCreate(data) {
    return BaseRepo.baseBulkCreate(userEmail, data);
}

async function userEmailDetail(params) {
    return BaseRepo.baseDetail(userEmail, params)
}

async function userEmailUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(userEmail, searchParams, data);
}

async function userEmailList(params) {
    return BaseRepo.baseList(userEmail, params)
}

async function userEmailCount(searchParams) {
    return BaseRepo.baseCount(userEmail, searchParams)
}

async function userEmailDelete(searchParams) {
    return BaseRepo.baseDelete(userEmail, searchParams)
}

async function userEmailRestore(searchParams) {
    return BaseRepo.baseRestore(userEmail, searchParams)
}

