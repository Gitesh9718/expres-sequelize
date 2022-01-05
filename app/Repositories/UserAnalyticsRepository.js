
'use strict';

const {userAnalytic} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.userAnalyticCreate = async function (data) {
    return BaseRepo.baseCreate(userAnalytic, data);
};

module.exports.userAnalyticBulkCreate = async function (data) {
    return BaseRepo.baseBulkCreate(userAnalytic, data);
};

module.exports.userAnalyticDetail = async function (params) {
    return BaseRepo.baseDetail(userAnalytic, params)
};

module.exports.userAnalyticUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(userAnalytic, searchParams, data);
};

module.exports.userAnalyticList = async function (params) {
    return BaseRepo.baseList(userAnalytic, params)
};

module.exports.userAnalyticDelete = async function (searchParams) {
    return BaseRepo.baseDelete(userAnalytic, searchParams)
};


