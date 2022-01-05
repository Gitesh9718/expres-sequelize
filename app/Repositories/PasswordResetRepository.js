/**
 * Created by manoj on 2/6/19.
 */
'use strict';

const {passwordReset} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.passwordResetCreate = async function (data) {
    return BaseRepo.baseCreate(passwordReset, data);
};

module.exports.passwordResetDetail = async function (params) {
    return BaseRepo.baseDetail(passwordReset, params)
};

module.exports.passwordResetUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(passwordReset, searchParams, data);
};

module.exports.passwordResetList = async function (params) {
    return BaseRepo.baseList(passwordReset, params)
};