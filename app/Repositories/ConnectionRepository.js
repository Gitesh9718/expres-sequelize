/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {connection} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    conversationBulkConnectionCreate: conversationBulkConnectionCreate,
    connectionCreate: connectionCreate,
    connectionDetail: connectionDetail,
    connectionUpdate: connectionUpdate,
    connectionList: connectionList,
    connectionDelete: connectionDelete,
    connectionCount: connectionCount,
};

async function conversationBulkConnectionCreate(data) {
    return BaseRepo.baseBulkCreate(connection, data);
}

async function connectionCreate(data) {
    return BaseRepo.baseCreate(connection, data);
}

async function connectionDetail(params) {
    return BaseRepo.baseDetail(connection, params)
}

async function connectionUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(connection, searchParams, data);
}

async function connectionList(params) {
    return BaseRepo.baseList(connection, params)
}

async function connectionDelete(searchParams) {
    return BaseRepo.baseDelete(connection, searchParams);
}

async function connectionCount(searchParams) {
    return BaseRepo.baseCount(connection, searchParams);
}
