/**
 * Created by manoj on 30/5/20.
 */
'use strict';

const {analytic} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.analyticCreate = async function (data) {
    return BaseRepo.baseCreate(analytic, data);
};

module.exports.analyticDetail = async function (params) {
    return BaseRepo.baseDetail(analytic, params)
};

module.exports.analyticUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(analytic, searchParams, data);
};

module.exports.analyticList = async function (params) {
    return BaseRepo.baseList(analytic, params)
};

module.exports.analyticDelete = async function (searchParams) {
    return BaseRepo.baseDelete(analytic, searchParams)
};
