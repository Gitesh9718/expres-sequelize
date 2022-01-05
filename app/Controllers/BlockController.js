/* global _appConstant, _errConstant */

'use strict';

// const {user, block} = require('models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const BlockRepo = require('app/Repositories/BlockRepository');

module.exports = {
    blockUser: blockUser,
    unBlockUser: unBlockUser
};

// block the user
async function blockUser (req, res, next) {
    const userId = req.user.id;
    const blockedUserId = req.params.userId;

    try {
        const blockDetail = await BlockRepo.blockDetail({ searchParams: { [Op.and]: [{ userId: userId }, { blockedUserId: blockedUserId }] } });
        // console.log('***blockDetail*** ', blockDetail.toJSON());
        // if there is already a record
        if (blockDetail) {
            return next({ message: _errConstant.USER_ALREADY_BLOCKED, status: 400 });
        }
        // else add the block record
        const blockedResult = await BlockRepo.addToBlock({ userId: userId, blockedUserId: blockedUserId });
        res.data = blockedResult.toJSON();
        next();
    }// try
    catch (err) {
        return next(err);
    }
}; // blockUser

// unblock a user
async function unBlockUser (req, res, next) {
    const userId = req.user.id;
    const blockedUserId = req.params.userId;

    try {
        const blockDetail = await BlockRepo.blockDetail({ searchParams: { [Op.and]: [{ userId: userId }, { blockedUserId: blockedUserId }] } });
        // if there is no such a record
        if (!blockDetail) {
            return next({ message: _errConstant.USER_NOT_BLOCKED, status: 400 });
        }
        // if resulted userId is not the requested userId
        if (blockDetail.userId !== userId) {
            return next({ message: _errConstant.NO_AUTH, status: 400 });
        }
        // else delete the record
        await BlockRepo.unBlock({ [Op.and]: [{ userId: userId }, { blockedUserId: blockedUserId }] });
        res.data = { message: 'User Unblocked Succesfully' };
        next();
    }// try
    catch (err) {
        return next(err);
    }
};// unblock
