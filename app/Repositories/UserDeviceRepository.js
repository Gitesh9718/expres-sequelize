/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const { userDevice } = require('models/index');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.userDeviceCreate = async function (data) {
    return BaseRepo.baseCreate(userDevice, data);
};

module.exports.userDeviceDetail = async function (params) {
    return BaseRepo.baseDetail(userDevice, params);
};

module.exports.userDeviceUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(userDevice, searchParams, data);
};

module.exports.userDeviceList = async function (params) {
    return BaseRepo.baseList(userDevice, params);
};

module.exports.userDeviceDelete = async function (searchParams) {
    return BaseRepo.baseDelete(userDevice, searchParams);
};
