/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {conversationUser} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    conversationUserBulkCreate: conversationUserBulkCreate,
    conversationUserCreate: conversationUserCreate,
    conversationUserDetail: conversationUserDetail,
    conversationUserUpdate: conversationUserUpdate,
    conversationUserList: conversationUserList,
    conversationUserDelete: conversationUserDelete,
    isConversationGroupAdmin: isConversationGroupAdmin
};

async function conversationUserBulkCreate(data) {
    return BaseRepo.baseBulkCreate(conversationUser, data);
}

async function conversationUserCreate(data) {
    return BaseRepo.baseCreate(conversationUser, data);
}

async function conversationUserDetail(params) {
    return BaseRepo.baseDetail(conversationUser, params)
}

async function conversationUserUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(conversationUser, searchParams, data);
}

async function conversationUserList(params) {
    return BaseRepo.baseList(conversationUser, params)
}

async function conversationUserDelete(searchParams) {
    return BaseRepo.baseDelete(conversationUser, searchParams)
}

async function isConversationGroupAdmin(userId, conversationId) {
    return !!await conversationUserDetail({searchParams: {userId, conversationId, role: _appConstant.CHAT_ROLE_ADMIN}});
}
