
'use strict';

const {commentLike} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    commentLikeCreate: commentLikeCreate,
    commentLikeDetail: commentLikeDetail,
    commentLikeUpdate: commentLikeUpdate,
    commentLikeList: commentLikeList,
    commentLikeDelete: commentLikeDelete,
    commentLikeRestore: commentLikeRestore
};

async function commentLikeCreate(data) {
    return BaseRepo.baseCreate(commentLike, data);
}

async function commentLikeDetail(params) {
    return BaseRepo.baseDetail(commentLike, params)
}

async function commentLikeUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(commentLike, searchParams, data);
}

async function commentLikeList(params) {
    return BaseRepo.baseList(commentLike, params)
}

async function commentLikeDelete(searchParams) {
    return BaseRepo.baseDelete(commentLike, searchParams)
}

async function commentLikeRestore (searchParams) {
    return BaseRepo.baseRestore(commentLike, searchParams)
};


