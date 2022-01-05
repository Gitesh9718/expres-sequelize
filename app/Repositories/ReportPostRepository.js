/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {reportPost} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    reportPostCreate: reportPostCreate,
    reportPostDetail: reportPostDetail,
    reportPostUpdate: reportPostUpdate,
    reportPostList: reportPostList,
    reportPostDelete: reportPostDelete,
    reportPostAggregate: reportPostAggregate
};

async function reportPostCreate(data) {
    return BaseRepo.baseCreate(reportPost, data);
}

async function reportPostDetail(params) {
    return BaseRepo.baseDetail(reportPost, params)
}

async function reportPostUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(reportPost, searchParams, data);
}

async function reportPostList(params) {
    return BaseRepo.baseList(reportPost, params)
}

async function reportPostDelete(searchParams) {
    return BaseRepo.baseDelete(reportPost, searchParams)
}

async function reportPostAggregate(column, fn, option) {
    return BaseRepo.baseAggregate(reportPost, column, fn, option)
}
