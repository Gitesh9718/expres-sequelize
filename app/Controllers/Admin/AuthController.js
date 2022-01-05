/**
 * Created by manoj on 29/6/19.
 */
'use strict';

const {to} = require('services/util.service');

const UserRepo = require('app/Repositories/UserRepository');
const UserMetaRepo = require('app/Repositories/UserMetaRepository');

module.exports = {
    login: login
};

async function login(req, res, next) {
    const body = req.body;
    let userMeta, user;

    if (!body.email) {
        return next({message: _errConstant.REQUIRED_EMAIL, status: 400});
    }

    const validEmails = ['manojrawat1502@gmail.com', 'naren1449@gmail.com', 'gael@meoh.io', 'yash.shekhawat@nuromedia.com'];

    if (validEmails.indexOf(body.email) === -1) {
        return next({message: _errConstant.ACCESS_DENIED, status: 400});
    }

    let userMetaParams = {
        searchParams: {email: body.email}
    };
    try {
        userMeta = await UserMetaRepo.userMetaDetail(userMetaParams);

        if (!userMeta) {
            return next({message: _errConstant.NO_ACCOUNT, status: 422});
        }

        if (!userMeta.comparePassword(body.password)) {
            next({message: _errConstant.INVALID_CREDENTIALS, status: 400});
        }

        let userParams = {
            searchParams: {userMetaId: userMeta.id}
        };

        user = await UserRepo.userDetail(userParams);

        let oldUser = user.toWeb();
        oldUser['email'] = userMeta.email;


        res.data = {token: user.getJWT(), user: oldUser, userMeta: userMeta.toJSON()};

        next();
    } catch (err) {
        next(err);
    }
}

