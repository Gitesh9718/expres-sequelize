/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {hashTag} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.hashTagBulkCreate = async function (data) {
    return BaseRepo.baseBulkCreate(hashTag, data);
};

module.exports.hashTagCreate = async function (data) {
    return BaseRepo.baseCreate(hashTag, data);
};

module.exports.hashTagDetail = async function (params) {
    return BaseRepo.baseDetail(hashTag, params)
};

module.exports.hashTagUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(hashTag, searchParams, data);
};

module.exports.hashTagList = async function (params) {
    return BaseRepo.baseList(hashTag, params)
};