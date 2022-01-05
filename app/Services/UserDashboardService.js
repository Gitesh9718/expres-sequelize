'use strict';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');
const PostDashboardRepo = require('app/Repositories/UserPostDashboardRepository');
const UserNetworkAwardRepo = require('app/Repositories/UserNetworkAwardRepository');
const userAwardDashboardRepo = require('app/Repositories/UserAwardDashboardRepository');

const { to } = require('services/util.service');

module.exports = {
    DailyPostDashboardDataCreateORIncrement,
    DailyPostDashboardDataDecrement,
    UserNetworkAwardCreateORUpdate,
    UserAwardGivenCreateOrUpdate
};

async function DailyPostDashboardDataCreateORIncrement (eventData, count = 1) {
    // get startOfDay & endOfDay as a bordered date for today
    const startOfDay = moment().startOf('day').format();
    const endOfDay = moment().endOf('day').format();
    console.log('Date between %s and %s ', startOfDay, endOfDay);

    // add createdAt filter in eventData SearchParam
    eventData['createdAt'] = { [Op.and]: { [Op.gte]: startOfDay, [Op.lte]: endOfDay } };
    console.log('searchParams -> ', eventData);

    let err;
    let result;
    [err, result] = await to(PostDashboardRepo.postDashboardRecordDetail({ searchParams: eventData }));
    if (err) throw new Error({ message: 'Internal server error', status: 500 });
    if (!result) {
        delete eventData.createdAt;
        const data = { ...eventData, count };
        [err] = await to(PostDashboardRepo.postDashboardRecordCreate(data));
        if (err) throw new Error({ message: 'Internal server error', status: 500 });
    } else {
        [err] = await to(PostDashboardRepo.postDashboardRecordUpdate({ id: result.id },
            { count: Sequelize.literal(`count + ${count}`) }));
        if (err) throw new Error({ message: 'Internal server error', status: 500 });
    }
}

/* for events (comment delete, unfavourite a post, delete a reposted post ) */
async function DailyPostDashboardDataDecrement (eventData, decrementBy = 1) {
    // get startOfDay & endOfDay as a bordered date for today
    const startOfDay = moment().startOf('day').format();
    const endOfDay = moment().endOf('day').format();
    console.log('Date between %s and %s ', startOfDay, endOfDay);

    // add createdAt filter in eventData SearchParam
    eventData['createdAt'] = { [Op.and]: { [Op.gte]: startOfDay, [Op.lte]: endOfDay } };
    console.log('searchParams -> ', eventData);

    let err;
    let result;
    [err, result] = await to(PostDashboardRepo.postDashboardRecordDetail({ searchParams: eventData }));
    if (err) throw new Error({ message: 'Internal server error', status: 500 });
    // decrement count only if record present
    if (result) {
        [err] = await to(PostDashboardRepo.postDashboardRecordUpdate({ id: result.id },
            { count: Sequelize.literal(`count - ${decrementBy}`) }));
        if (err) throw new Error({ message: 'Internal server error', status: 500 });
    }
}

/* user award for network */
async function UserNetworkAwardCreateORUpdate (receiverId) {
    // get startOfDay & endOfDay as a bordered date for today
    const startOfDay = moment().startOf('day').format();
    const endOfDay = moment().endOf('day').format();

    const eventData = { userId: receiverId };
    // add createdAt filter in eventData SearchParam
    eventData['createdAt'] = { [Op.and]: { [Op.gte]: startOfDay, [Op.lte]: endOfDay } };

    let err;
    let result;
    [err, result] = await to(UserNetworkAwardRepo.userNetworkAwardDetail({ searchParams: eventData }));
    if (err) throw new Error({ message: 'Internal server error', status: 500 });
    if (!result) {
        delete eventData.createdAt;
        [err] = await to(UserNetworkAwardRepo.userNetworkAwardCreate(eventData));
        if (err) throw new Error({ message: 'Internal server error', status: 500 });
    } else {
        [err] = await to(UserNetworkAwardRepo.userNetworkAwardUpdate({ id: result.id },
            { awardCount: Sequelize.literal('awardCount + 1') }));
        if (err) throw new Error({ message: 'Internal server error', status: 500 });
    }
}

/* user award for giving award to network */
async function UserAwardGivenCreateOrUpdate (userId, receiverId) {
    // get startOfDay & endOfDay as a bordered date for today
    const startOfDay = moment().startOf('day').format();
    const endOfDay = moment().endOf('day').format();

    const eventData = { userId: userId, receiverId: receiverId };
    // add createdAt filter in eventData SearchParam
    eventData['createdAt'] = { [Op.and]: { [Op.gte]: startOfDay, [Op.lte]: endOfDay } };

    let err;
    let result;
    [err, result] = await to(userAwardDashboardRepo.userAwardDashboardDetail({ searchParams: eventData }));
    if (err) throw new Error({ message: 'Internal server error', status: 500 });
    if (!result) {
        delete eventData.createdAt;
        [err] = await to(userAwardDashboardRepo.userAwardDashboardCreate(eventData));
        if (err) throw new Error({ message: 'Internal server error', status: 500 });
    } else {
        [err] = await to(userAwardDashboardRepo.userAwardDashboardUpdate({ id: result.id },
            { awardCount: Sequelize.literal('awardCount + 1') }));
        if (err) throw new Error({ message: 'Internal server error', status: 500 });
    }
}
