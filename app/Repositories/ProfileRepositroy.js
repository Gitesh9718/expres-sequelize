'use strict';

const { profile } = require('models/index');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.profileCreate = async function (data) {
    return BaseRepo.baseCreate(profile, data);
};

module.exports.profileDetail = async function (params) {
    return BaseRepo.baseDetail(profile, params)
};

module.exports.profileUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(profile, searchParams, data);
};

module.exports.profileList = async function (params) {
    return BaseRepo.baseList(profile, params)
};