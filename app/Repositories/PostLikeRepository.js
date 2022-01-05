
'use strict';

const {postLike} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    postLikeCreate: postLikeCreate,
    postLikeDetail: postLikeDetail,
    postLikeUpdate: postLikeUpdate,
    postLikeList: postLikeList,
    postLikeDelete: postLikeDelete,
    postLikeRestore: postLikeRestore
};

async function postLikeCreate(data) {
    return BaseRepo.baseCreate(postLike, data);
}

async function postLikeDetail(params) {
    return BaseRepo.baseDetail(postLike, params)
}

async function postLikeUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(postLike, searchParams, data);
}

async function postLikeList(params) {
    return BaseRepo.baseList(postLike, params)
}

async function postLikeDelete(searchParams) {
    return BaseRepo.baseDelete(postLike, searchParams)
}

async function postLikeRestore (searchParams) {
    return BaseRepo.baseRestore(postLike, searchParams)
};


