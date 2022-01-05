const { userPostDashboard } = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    postDashboardRecordCreate,
    postDashboardRecordDetail,
    postDashboardRecordUpdate,
    postDashboardRecordList
};

async function postDashboardRecordCreate (data) {
    return BaseRepo.baseCreate(userPostDashboard, data);
}

async function postDashboardRecordDetail (params) {
    return BaseRepo.baseDetail(userPostDashboard, params);
}

async function postDashboardRecordUpdate (searchParams, data) {
    return BaseRepo.baseUpdate(userPostDashboard, searchParams, data);
}

async function postDashboardRecordList (params) {
    return BaseRepo.baseList(userPostDashboard, params);
}
