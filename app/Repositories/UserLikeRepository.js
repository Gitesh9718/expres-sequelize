'use strict';

const {userLike} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    userLikeCreate: userLikeCreate,
    userLikeDetail: userLikeDetail,
    userLikeUpdate: userLikeUpdate,
    userLikeList: userLikeList,
    userLikeDelete: userLikeDelete,
    userLikeRestore: userLikeRestore
};

async function userLikeCreate(data) {
    return BaseRepo.baseCreate(userLike, data);
}

async function userLikeDetail(params) {
    return BaseRepo.baseDetail(userLike, params)
}

async function userLikeUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(userLike, searchParams, data);
}

async function userLikeList(params) {
    return BaseRepo.baseList(userLike, params)
}

async function userLikeDelete(searchParams) {
    return BaseRepo.baseDelete(userLike, searchParams)
}

async function userLikeRestore (searchParams) {
    return BaseRepo.baseRestore(userLike, searchParams)
}


