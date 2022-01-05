'use strict';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {userMeta, file} = require('models');

const moment = require('moment');

const UserRepo = require('app/Repositories/UserRepository');


module.exports = {
    getAllUsers: getAllUsers,
    blockUser: blockUser,
    unblockUser: unblockUser
};

async function getAllUsers(req, res, next) {
    let searchParams = {};
    switch (req.searchQuery.status) {
        case 'NEW':
            searchParams = {createdAt: {[Op.gt]: moment().subtract(1, 'd')}};
            break;
        case 'LOCKED':
            searchParams = {status: _appConstant.USER_STATUS_BLOCK};
            break;
        case 'ACTIVE':
            searchParams = {status: _appConstant.USER_STATUS_ACTIVE};
            break;
    }

    let userParams = {
        attributes: {exclude: ['password']},
        searchParams: searchParams,
        include: [
            {model: userMeta, as: 'userMeta'},
            {model: file, as: 'profileImage'}
        ],
        order: [
            ['createdAt', 'DESC']
        ],
        limit: req.limit,
        offset: req.skip
    };
    /*if (Object.keys(searchParams).length) {
        userParams['searchParams'] = searchParams;
    }*/
    try {
        let users = await UserRepo.userList(userParams);

        res.data = {items: users.rows, paginate: {total: users.count}};
        return next();
    } catch (err) {
        next(err);
    }
}


async function blockUser(req, res, next) {
    try {
        let originalUser = await UserRepo.userDetail({searchParams: {id: req.params.id}});
        if (!originalUser) {
            return next({message: _errConstant.NO_PUBLICATION, status: 400});
        }

        await UserRepo.userUpdate({id: originalUser.id}, {status: _appConstant.USER_STATUS_BLOCK});

        next();
    } catch (err) {
        next(err);
    }
}

async function unblockUser(req, res, next) {
    try {
        let originalUser = await UserRepo.userDetail({searchParams: {id: req.params.id}});
        if (!originalUser) {
            return next({message: _errConstant.NO_PUBLICATION, status: 400});
        }

        await UserRepo.userUpdate({id: originalUser.id}, {status: _appConstant.USER_STATUS_ACTIVE});

        next();
    } catch (err) {
        next(err);
    }
}
