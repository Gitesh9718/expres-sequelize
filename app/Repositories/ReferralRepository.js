/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {referral} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.referralCreate = async function (data) {
    return BaseRepo.baseCreate(referral, data);
};

module.exports.referralDetail = async function (params) {
    return BaseRepo.baseDetail(referral, params)
};

module.exports.referralUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(referral, searchParams, data);
};

module.exports.referralList = async function (params) {
    return BaseRepo.baseList(referral, params)
};

module.exports.referralDelete = async function (searchParams) {
    return BaseRepo.baseDelete(referral, searchParams)
};
