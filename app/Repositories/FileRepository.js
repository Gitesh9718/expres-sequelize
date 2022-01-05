/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {file} = require('models/index');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.fileCreate = async function (data) {
    return BaseRepo.baseCreate(file, data);
};

module.exports.fileDetail = async function (params) {
    return BaseRepo.baseDetail(file, params)
};

module.exports.fileUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(file, searchParams, data);
};

module.exports.fileList = async function (params) {
    return BaseRepo.baseList(file, params)
};