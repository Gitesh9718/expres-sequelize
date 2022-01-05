/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {post} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');
const db = require('models');

module.exports = {
    postCreate: postCreate,
    postDetail: postDetail,
    postUpdate: postUpdate,
    postList: postList,
    postDelete: postDelete,
    postCount: postCount,
    postTotalAwardsCountInc: postTotalAwardsCountInc
};

async function postCreate(data) {
    return BaseRepo.baseCreate(post, data);
}

async function postDetail(params) {
    return BaseRepo.baseDetail(post, params)
}

async function postUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(post, searchParams, data);
}

async function postList(params) {
    return BaseRepo.baseList(post, params)
}

async function postDelete(searchParams) {
    return BaseRepo.baseDelete(post, searchParams)
}

async function postCount(searchParams) {
    return BaseRepo.baseCount(post, searchParams)
}

async function postTotalAwardsCountInc(postId, count = 1) {
    return db.sequelize.query(`UPDATE posts SET totalAwards = totalAwards + ${count} WHERE id=${postId}`);
}
