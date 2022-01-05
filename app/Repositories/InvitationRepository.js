/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {invitation} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    invitationCreate: invitationCreate,
    invitationDetail: invitationDetail,
    invitationUpdate: invitationUpdate,
    invitationList: invitationList,
    invitationDelete: invitationDelete,
};

async function invitationCreate(data) {
    return BaseRepo.baseCreate(invitation, data);
}

async function invitationDetail(params) {
    return BaseRepo.baseDetail(invitation, params)
}

async function invitationUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(invitation, searchParams, data);
}

async function invitationList(params) {
    return BaseRepo.baseList(invitation, params)
}

async function invitationDelete(searchParams) {
    return BaseRepo.baseDelete(invitation, searchParams)
}
