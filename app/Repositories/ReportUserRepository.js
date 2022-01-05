/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {reportUser} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    reportUserCreate: reportUserCreate,
    reportUserDetail: reportUserDetail,
    reportUserUpdate: reportUserUpdate,
    reportUserList: reportUserList,
    reportUserDelete: reportUserDelete,
    reportUserAggregate: reportUserAggregate
};

async function reportUserCreate(data) {
    return BaseRepo.baseCreate(reportUser, data);
}

async function reportUserDetail(params) {
    return BaseRepo.baseDetail(reportUser, params)
}

async function reportUserUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(reportUser, searchParams, data);
}

async function reportUserList(params) {
    return BaseRepo.baseList(reportUser, params)
}

async function reportUserDelete(searchParams) {
    return BaseRepo.baseDelete(reportUser, searchParams)
}

async function reportUserAggregate(column, fn, option) {
    return BaseRepo.baseAggregate(reportUser, column, fn, option)
}
