const { userNetworkAward } = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    userNetworkAwardCreate,
    userNetworkAwardDetail,
    userNetworkAwardUpdate,
    userNetworkAwardList
};

async function userNetworkAwardCreate (data) {
    return BaseRepo.baseCreate(userNetworkAward, data);
}

async function userNetworkAwardDetail (params) {
    return BaseRepo.baseDetail(userNetworkAward, params);
}

async function userNetworkAwardUpdate (searchParams, data) {
    return BaseRepo.baseUpdate(userNetworkAward, searchParams, data);
}

async function userNetworkAwardList (params) {
    return BaseRepo.baseList(userNetworkAward, params);
}
