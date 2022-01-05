/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {userMeta} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    userMetaCreate: userMetaCreate,
    userMetaDetail: userMetaDetail,
    userMetaUpdate: userMetaUpdate,
    userMetaPasswordUpdate: userMetaPasswordUpdate,
    userMetaList: userMetaList,
    userMetaDelete: userMetaDelete
};

async function userMetaCreate(data) {
    return BaseRepo.baseCreate(userMeta, data)
}

async function userMetaDetail(params) {
    return BaseRepo.baseDetail(userMeta, params)
}

async function userMetaUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(userMeta, searchParams, data)
}

async function userMetaPasswordUpdate(searchParams, data) {
    let userMetaObj = await userMeta.findOne({where: searchParams});
    userMetaObj.set(data);

    return userMetaObj.save();
}

async function userMetaList(params) {
    return BaseRepo.baseList(userMeta, params)
}

async function userMetaDelete(searchParams) {
    return BaseRepo.baseDelete(userMeta, searchParams)
}
