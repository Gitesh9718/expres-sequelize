const { userAwardDashboard } = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    userAwardDashboardCreate,
    userAwardDashboardDetail,
    userAwardDashboardUpdate,
    userAwardDashboardList
};

async function userAwardDashboardCreate (data) {
    return BaseRepo.baseCreate(userAwardDashboard, data);
}

async function userAwardDashboardDetail (params) {
    return BaseRepo.baseDetail(userAwardDashboard, params);
}

async function userAwardDashboardUpdate (searchParams, data) {
    return BaseRepo.baseUpdate(userAwardDashboard, searchParams, data);
}

async function userAwardDashboardList (params) {
    return BaseRepo.baseList(userAwardDashboard, params);
}
