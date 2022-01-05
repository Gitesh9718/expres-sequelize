const {report} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    reportCreate: reportCreate,
    reportDetail: reportDetail,
    reportUpdate: reportUpdate,
    reportList: reportList,
    reportDelete: reportDelete,
    reportAggregate: reportAggregate
};

async function reportCreate(data) {
    return BaseRepo.baseCreate(report, data);
}

async function reportDetail(params) {
    return BaseRepo.baseDetail(report, params)
}

async function reportUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(report, searchParams, data);
}

async function reportList(params) {
    return BaseRepo.baseList(report, params)
}

async function reportDelete(searchParams) {
    return BaseRepo.baseDelete(report, searchParams)
}

async function reportAggregate(column, fn, option) {
    return BaseRepo.baseAggregate(report, column, fn, option)
}
