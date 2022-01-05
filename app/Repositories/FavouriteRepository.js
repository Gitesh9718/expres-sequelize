/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const { favourite } = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.favouriteCreate = async function (data) {
    return BaseRepo.baseCreate(favourite, data);
};

module.exports.favouriteDetail = async function (params) {
    return BaseRepo.baseDetail(favourite, params);
};

module.exports.favouriteUpdate = async function (params, data) {
    return BaseRepo.baseUpdate(favourite, params, data);
};

module.exports.favouriteList = async function (params) {
    return BaseRepo.baseList(favourite, params);
};

module.exports.favouriteDelete = async function (searchParams) {
    return BaseRepo.baseDelete(favourite, searchParams);
};

module.exports.favouriteRestore = async function (searchParams) {
    return BaseRepo.baseRestore(favourite, searchParams);
};

module.exports.favouriteCount = async function (searchParams) {
    return BaseRepo.baseCount(favourite, searchParams);
};
