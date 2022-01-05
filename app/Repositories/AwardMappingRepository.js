'use strict'

const {awardMapping} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    awardMappingCreate: awardMappingCreate,
    awardMappingBulkCreate: awardMappingBulkCreate,
    awardMappingDetail: awardMappingDetail,
    awardMappingUpdate: awardMappingUpdate,
    awardMappingList: awardMappingList,
    awardMappingDelete: awardMappingDelete,
    awardMappingCount: awardMappingCount
};

async function awardMappingCreate(data){
    return BaseRepo.baseCreate(awardMapping, data);
}

async function awardMappingBulkCreate(data){
    return BaseRepo.baseBulkCreate(awardMapping, data);
}

async function awardMappingDetail(params) {
    return BaseRepo.baseDetail(awardMapping, params)
}

async function awardMappingUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(awardMapping, searchParams, data);
}

async function awardMappingList(params) {
    return BaseRepo.baseList(awardMapping, params)
}

async function awardMappingDelete(searchParams) {
    return BaseRepo.baseDelete(awardMapping, searchParams)
}

async function awardMappingCount(searchParams) {
    return BaseRepo.baseCount(awardMapping, searchParams)
}
