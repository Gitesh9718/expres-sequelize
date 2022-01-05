/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {user} = require('models/index');
const db = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    userCreate: userCreate,
    userDetail: userDetail,
    userUpdate: userUpdate,
    userList: userList,
    userCount: userCount,
    userDelete: userDelete,
    userPasswordUpdate: userPasswordUpdate,
    userTotalAwardsCountInc: userTotalAwardsCountInc,
    userCoinsUpdate: userCoinsUpdate
};

async function userCreate(data) {
    return BaseRepo.baseCreate(user, data);
}

async function userDetail(params) {
    return BaseRepo.baseDetail(user, params)
}

async function userUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(user, searchParams, data);
}

async function userList(params) {
    return BaseRepo.baseList(user, params)
}

async function userCount(searchParams) {
    return BaseRepo.baseCount(user, searchParams)
}

async function userDelete(searchParams) {
    return BaseRepo.baseDelete(user, searchParams)
}

async function userPasswordUpdate(searchParams, data) {
    let userMetaObj = await user.findOne({where: searchParams});
    userMetaObj.set(data);

    return userMetaObj.save();
}

async function userTotalAwardsCountInc(userId, count = 1){
    return db.sequelize.query(`UPDATE users SET totalAwards = totalAwards + ${count} WHERE id=${userId}`);
}

async function userCoinsUpdate(userIds, amount){
    return db.sequelize.query(`UPDATE users SET coins = coins + ${amount} WHERE id in (${userIds})`);
}
