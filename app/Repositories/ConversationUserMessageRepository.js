/**
 * Created by manoj on 30/5/19.
 */
'use strict';
const {sequelize} = require('models');
const {conversationUserMessage} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports = {
    conversationUserMessageBulkCreate: conversationUserMessageBulkCreate,
    conversationUserBulkMessageCreate: conversationUserBulkMessageCreate,
    conversationUserMessageCreate: conversationUserMessageCreate,
    conversationUserMessageDetail: conversationUserMessageDetail,
    conversationUserMessageUpdate: conversationUserMessageUpdate,
    conversationUserMessageList: conversationUserMessageList,
    conversationUserMessageDelete: conversationUserMessageDelete,
    updateUserMessage: updateUserMessage,
    conversationUserMessageCount: conversationUserMessageCount
};

async function updateUserMessage(convoId, userId) {
    await sequelize.query("UPDATE conversationUserMessages as um " +
        "join conversationMessages as cm on cm.id = um.conversationMessageId and cm.userId != " + userId + " " +
        "set status = 'READ' where um.conversationId = " + convoId + " ");
}

async function conversationUserMessageBulkCreate(data) {
    return BaseRepo.baseBulkCreate(conversationUserMessage, data);
}

async function conversationUserBulkMessageCreate(data) {
    return BaseRepo.baseBulkCreate(conversationUserMessage, data);
}

async function conversationUserMessageCreate(data) {
    return BaseRepo.baseCreate(conversationUserMessage, data);
}

async function conversationUserMessageDetail(params) {
    return BaseRepo.baseDetail(conversationUserMessage, params)
}

async function conversationUserMessageUpdate(searchParams, data) {
    return BaseRepo.baseUpdate(conversationUserMessage, searchParams, data);
}

async function conversationUserMessageList(params) {
    return BaseRepo.baseList(conversationUserMessage, params)
}

async function conversationUserMessageDelete(searchParams) {
    return BaseRepo.baseDelete(conversationUserMessage, searchParams)
}

async function conversationUserMessageCount(searchParams){
    return BaseRepo.baseCount(conversationUserMessage, searchParams);
}
