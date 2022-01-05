/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {chatRequest} = require('models/index');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.chatRequestCreate = async function (data) {
    return BaseRepo.baseCreate(chatRequest, data);
};

module.exports.chatRequestDetail = async function (params) {
    return BaseRepo.baseDetail(chatRequest, params)
};

module.exports.chatRequestUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(chatRequest, searchParams, data);
};

module.exports.chatRequestList = async function (params) {
    return BaseRepo.baseList(chatRequest, params)
};
