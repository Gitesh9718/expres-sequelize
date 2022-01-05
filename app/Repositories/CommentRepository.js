/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {comment} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');
const db = require('models');

module.exports = {
    commentCreate: commentCreate,
    commentDetail: commentDetail,
    commentUpdate: commentUpdate,
    commentList: commentList,
    commentDelete: commentDelete,
    commentCount: commentCount,
    commentTotalAwardsCountInc: commentTotalAwardsCountInc
};

async function commentCreate(data) {
    return BaseRepo.baseCreate(comment, data);
}

async function commentDetail(params) {
    return BaseRepo.baseDetail(comment, params)
}

async function commentUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(comment, searchParams, data);
}

async function commentList(params) {
    return BaseRepo.baseList(comment, params)
}

async function commentDelete(searchParams) {
    return BaseRepo.baseDelete(comment, searchParams)
}

async function commentCount(searchParams) {
    return BaseRepo.baseCount(comment, searchParams)
}

async function commentTotalAwardsCountInc(commentId, count = 1){
    return db.sequelize.query(`UPDATE comments SET totalAwards = totalAwards + ${count} WHERE id=${commentId}`);
}
