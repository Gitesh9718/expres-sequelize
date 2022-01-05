/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {postHashTag} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.postHashTagBulkCreate = async function (data) {
    return BaseRepo.baseBulkCreate(postHashTag, data);
};
module.exports.postHashTagCreate = async function (data) {
    return BaseRepo.baseCreate(postHashTag, data);
};

module.exports.postHashTagDetail = async function (params) {
    return BaseRepo.baseDetail(postHashTag, params)
};

module.exports.postHashTagUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(postHashTag, searchParams, data);
};

module.exports.postHashTagList = async function (params) {
    return BaseRepo.baseList(postHashTag, params)
};