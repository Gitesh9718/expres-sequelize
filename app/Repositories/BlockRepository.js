'use strict';

const { block } = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    blockDetail: blockDetail,
    blockList: blockList,
    addToBlock: addToBlock,
    unBlock: unBlock,
    getAllBlockedUsers: getAllBlockedUsers
};

// get Blocked users detail
async function blockDetail (params) {
    return BaseRepo.baseDetail(block, params);
}

// get blocked users list
async function blockList (params) {
    return BaseRepo.baseList(block, params);
}

// add user to block them
async function addToBlock (data) {
    return BaseRepo.baseCreate(block, data);
}

// delete blocked record(unblock)
async function unBlock (searchParams) {
    return BaseRepo.baseDelete(block, searchParams);
}

async function getAllBlockedUsers (userId) {
    const params = {
        searchParams: {
            [Op.or]: [
                { userId: userId },
                { blockedUserId: userId }
            ]
        }
    };
    const blockUsersData = await BaseRepo.baseList(block, params);
    const blockUserList = [];
    if (blockUsersData && blockUsersData.length) {
        blockUsersData.forEach(block => {
            if (parseInt(block.userId) === parseInt(userId)) {
                blockUserList.push(block.blockedUserId);
            } else if (parseInt(block.blockedUserId) === parseInt(userId)) {
                blockUserList.push(block.userId);
            }
        });
    }

    return blockUserList;
}
