/**
 * Created by manoj on 30/5/19.
 */
'use strict';
const { user } = require('models');
const ChatRequestRepo = require('app/Repositories/ChatRequestRepository');

module.exports.listRequest = async function (req, res, next) {
    const searchParams = req.searchQuery || {};

    const chatParams = {
        searchParams: { status: 'PENDING' },
        include: [
            { model: user, as: 'requestedUser', attributes: _appConstant.USER_BASIC_INFO_FIELDS }
        ],
        order: [
            ['createdAt', 'DESC']
        ],
        limit: req.limit,
        offset: req.skip
    };

    if (searchParams.type === 'SENT') {
        chatParams.searchParams['userId'] = req.user.id;
        chatParams.include.push({ model: user, as: 'approverUser', attributes: _appConstant.USER_BASIC_INFO_FIELDS });
    } else {
        chatParams.searchParams['approverUserId'] = req.user.id;
        chatParams.include.push({ model: user, as: 'user', attributes: _appConstant.USER_BASIC_INFO_FIELDS });
    }

    try {
        const requests = await ChatRequestRepo.chatRequestList(chatParams);

        res.data = { items: requests.rows, paginate: { total: requests.count } };

        return next();
    } catch (err) {
        next(err);
    }
};

module.exports.store = async function (req, res, next) {
    const body = req.body;

    if (!body.message) {
        return next({ message: _errConstant.REQUIRED_MESSAGE, status: 400 });
    }
    if (!body.approverUserId) {
        return next({ message: _errConstant.REQUIRED_APPROVER_USER_ID, status: 400 });
    }

    body['requestedUserId'] = req.params.requestedUserId;
    body['userId'] = req.user.id;

    try {
        const request = await ChatRequestRepo.chatRequestDetail({
            searchParams: {
                approverUserId: body.approverUserId,
                requestedUserId: body.requestedUserId,
                userId: body.userId
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        if (request && request.status !== 'REJECTED') {
            let message = '';
            switch (request.status) {
            case 'PENDING':
                message = _errConstant.REQUEST_PENDING_FOR_APPROVAL;
                break;
            case 'APPROVED':
                message = _errConstant.REQUEST_ALREADY_APPROVED;
                break;
            }

            return next({ message: message, status: 400 });
        }
        await ChatRequestRepo.chatRequestCreate(body);
        next();
    } catch (err) {
        next(err);
    }
};

module.exports.acceptRequest = async function (req, res, next) {
    try {
        await checkRequestStatus(req, res, next);

        await ChatRequestRepo.chatRequestUpdate({ id: req.params.id }, { status: 'APPROVED' });

        next();
    } catch (err) {
        return next(err);
    }
};

module.exports.rejectRequest = async function (req, res, next) {
    try {
        await checkRequestStatus(req, res, next);

        const updateParams = { status: 'REJECTED' };
        await ChatRequestRepo.chatRequestUpdate({ id: req.params.id }, updateParams);

        next();
    } catch (err) {
        return next(err);
    }
};

async function checkRequestStatus (req, res, next) {
    try {
        const request = await ChatRequestRepo.chatRequestDetail({ searchParams: { id: req.params.id } });

        if (!request) {
            return next({ message: _errConstant.NO_REQUEST, status: 404 });
        }

        if (request && request.status !== 'PENDING') {
            let message = '';
            switch (request.status) {
            case 'REJECTED':
                message = REQUEST_ALREADY_REJECTED;
                break;
            case 'APPROVED':
                message = _errConstant.REQUEST_ALREADY_APPROVED;
                break;
            }

            return next({ message: message, status: 400 });
        }
    } catch (err) {
        return next(err);
    }
}
