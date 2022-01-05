/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {friend} = require('models');
const db = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.friendBulkCreate = async function (data) {
    return BaseRepo.baseBulkCreate(friend, data);
};

module.exports.friendCreate = async function (data) {
    return BaseRepo.baseCreate(friend, data);
};

module.exports.friendCount = async function (searchParams) {
    return BaseRepo.baseCount(friend, searchParams);
};

module.exports.friendDetail = async function (params) {
    return BaseRepo.baseDetail(friend, params)
};

module.exports.friendUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(friend, searchParams, data);
};

module.exports.friendList = async function (params) {
    return BaseRepo.baseList(friend, params)
};

module.exports.friendDelete = async function (searchParams) {
    return BaseRepo.baseDelete(friend, searchParams)
};

module.exports.friendPostCountAndLastPostUpdate = async function(friendId, count = 1){
    return db.sequelize.query(`UPDATE friends SET postCount = postCount + ${count}, lastPostAt = CURRENT_TIMESTAMP() WHERE friendId = ${friendId}`)
}