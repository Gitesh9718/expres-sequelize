'use strict';

const {award} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    awardCreate: awardCreate,
    awardBulkCreate: awardBulkCreate,
    awardDetail: awardDetail,
    awardUpdate: awardUpdate,
    awardList: awardList,
    awardDelete: awardDelete,
    awardCount: awardCount
};

async function awardCreate(data){
    return BaseRepo.baseCreate(award, data);
}

async function awardBulkCreate(data){
    return BaseRepo.baseBulkCreate(award, data);
}

async function awardDetail(params) {
    return BaseRepo.baseDetail(award, params)
}

async function awardUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(award, searchParams, data);
}

async function awardList(params) {
    return BaseRepo.baseList(award, params)
}

async function awardDelete(searchParams) {
    return BaseRepo.baseDelete(award, searchParams)
}

async function awardCount(searchParams) {
    return BaseRepo.baseCount(award, searchParams)
}
