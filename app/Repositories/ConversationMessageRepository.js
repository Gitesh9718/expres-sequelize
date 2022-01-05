/* global _appConstant, _config */
/**
 * Created by manoj on 30/5/19.
 */
'use strict';
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('models');
const { conversationMessage, file, user, post, conversationUser, friend } = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');
const ConversationRepo = require('app/Repositories/ConversationRepository');
const ConversationUserMessageRepo = require('app/Repositories/ConversationUserMessageRepository');
const BlockRepo = require('app/Repositories/BlockRepository');

const EncryptionService = require('app/Services/EncryptionService');

const PUBNUB = require('../../message-pipeline');

module.exports = {
    conversationBulkMessageCreate: conversationBulkMessageCreate,
    conversationMessageCreate: conversationMessageCreate,
    conversationMessageDetail: conversationMessageDetail,
    conversationMessageUpdate: conversationMessageUpdate,
    conversationMessageList: conversationMessageList,
    sendMessageToUser: sendMessageToUser,
    conversationMessageDelete: conversationMessageDelete,
    sendMessageToGroup: sendMessageToGroup,
    forwardMessage: forwardMessage
};

async function forwardMessage (conversationIds, messageId, sender) {
    let message = await conversationMessageDetail({ searchParams: { id: messageId } });
    message = message.toJSON();
    /* if original message creator not present */
    if (!message.originalMessageCreatorId) {
        message['originalMessageCreatorId'] = message['userId'];
    }

    delete message['id'];
    delete message['conversationId'];
    delete message['userId'];
    delete message['createdAt'];
    delete message['updatedAt'];
    for (const conversationId of conversationIds) {
        await sendMessageToGroup(conversationId, sender, message);
    }
}

async function sendMessageToGroup (conversationId, sender, messageData) {
    const ConversationUserRepo = require('app/Repositories/ConversationUserRepository');
    const NotificationHelper = require('app/Services/NotificationHelper');
    const ConversationRepo = require('app/Repositories/ConversationRepository');

    messageData['conversationId'] = conversationId;
    messageData['userId'] = sender.id;

    const convoUserParams = {
        searchParams: { id: conversationId },
        include: [
            {
                model: conversationUser,
                as: 'conversationUser',
                where: { userId: sender.id },
                include: [
                    {
                        model: user,
                        attributes: ['id', 'name', 'image'],
                        include: [{
                            model: file,
                            as: 'profileImage'
                        }]
                    }
                ]
            }
        ]
    };

    let conversation = await ConversationRepo.conversationDetail(convoUserParams);
    if (!conversation) {
        throw {
            message: 'Conversation not found',
            status: 400
        };
    }

    conversation = conversation.toJSON();

    // get convo users
    const conversationUsers = await ConversationUserRepo.conversationUserList({ searchParams: { conversationId: conversationId } });
    const messages = [];
    const receivers = [];

    conversationUsers.forEach(user => {
        if (user.userId !== messageData['userId']) {
            receivers.push(user.userId);
        }
    });

    // throw error for blocked user
    if (conversation && conversation.type === _appConstant.CHAT_TYPE_SINGLE && receivers.length) {
        // get block list
        const receiverID = receivers[0];
        const blockParams = {
            searchParams: {
                [Op.or]: [
                    { userId: sender.id, blockedUserId: receiverID },
                    { userId: receiverID, blockedUserId: sender.id }
                ]
            }
        };

        const blockData = await BlockRepo.blockDetail(blockParams);
        if (blockData && parseInt(blockData.userId) === parseInt(sender.id)) {
            throw {
                message: _errConstant.USER_BLOCKED_BY_YOU,
                status: 400
            };
        } else if (blockData && parseInt(blockData.userId) === parseInt(receiverID)) {
            throw {
                message: _errConstant.BLOCKED_BY_USER,
                status: 400
            };
        }
    }

    const message = await conversationMessageCreate(messageData);

    const markRead = await PUBNUB.isUserOnlineOnChat(receivers, conversation.id);

    conversationUsers.forEach(user => {
        /* let status = 'DELIVERED';
        if (user.userId !== messageData['userId']) {
            // receivers.push(user.userId);
        } else {
            status = markRead ? 'READ' : status;
        } */
        const status = markRead ? 'READ' : 'DELIVERED';

        messages.push({
            userId: user.userId,
            conversationMessageId: message.id,
            conversationId: messageData['conversationId'],
            status: status,
            createdAt: moment(),
            updatedAt: moment()
        });
    });

    const convoUserMsgList = await ConversationUserMessageRepo.conversationUserMessageBulkCreate(messages);
    for (const msg of convoUserMsgList) {
        db.sequelize.query(`UPDATE conversationUsers SET lastMessageId = (SELECT MAX(conversationMessageId) FROM conversationUserMessages WHERE conversationId= ${msg.conversationId} AND userId = ${msg.userId} AND deletedAt IS null) WHERE conversationId = ${msg.conversationId} AND userId = ${msg.userId}`);
    }

    const messageParams = {
        searchParams: {
            userId: sender.id,
            conversationMessageId: message.id
        },
        include: [{
            model: conversationMessage,
            include: [
                {
                    model: conversationUser,
                    as: 'conversationUser', // <-- model name and alias name as defined in association
                    on: {
                        [Op.and]: [
                            Sequelize.where(
                                Sequelize.col('conversationMessage.conversationId'),
                                Op.eq,
                                Sequelize.col('conversationMessage->conversationUser.conversationId')
                            ),
                            Sequelize.where(
                                Sequelize.col('conversationMessage.userId'),
                                Op.eq,
                                Sequelize.col('conversationMessage->conversationUser.userId')
                            )
                        ]
                    },
                    paranoid: false
                },
                { model: file },
                {
                    model: user,
                    attributes: { exclude: _appConstant.USER_HIDDEN_FIELDS },
                    include: [{
                        model: file,
                        as: 'profileImage'
                    }]
                },
                {
                    model: conversationMessage,
                    as: 'reply',
                    include: [{
                        model: user,
                        attributes: _appConstant.USER_BASIC_INFO_FIELDS
                    }]
                },
                {
                    model: user,
                    as: 'recommendUser',
                    include: [
                        {
                            model: friend,
                            include: [
                                {
                                    model: user,
                                    attributes: _appConstant.USER_BASIC_INFO_FIELDS,
                                    include: [{
                                        model: file,
                                        as: 'profileImage'
                                    }]
                                }
                            ],
                            limit: 4
                        }, {
                            model: file,
                            as: 'profileImage'
                        }
                    ]
                },
                {
                    model: user,
                    as: 'introducedUser',
                    include: [
                        {
                            model: friend,
                            where: { friendId: sender.id },
                            required: false,
                            include: [
                                {
                                    model: user,
                                    attributes: _appConstant.USER_BASIC_INFO_FIELDS,
                                    include: [{
                                        model: file,
                                        as: 'profileImage'
                                    }]
                                }
                            ]
                        },
                        {
                            model: file,
                            as: 'profileImage'
                        }
                    ]
                },
                {
                    model: user,
                    as: 'originalMessageCreator',
                    attributes: { exclude: _appConstant.USER_HIDDEN_FIELDS },
                    include: [{
                        model: file,
                        as: 'profileImage'
                    }]
                },
                {
                    model: post,
                    include: [
                        {
                            model: post,
                            as: 'parentPost',
                            include: [
                                {
                                    model: user,
                                    include: [{
                                        model: file,
                                        as: 'profileImage'
                                    }]
                                },
                                { model: file }
                            ]
                        },
                        {
                            model: user,
                            include: [{
                                model: file,
                                as: 'profileImage'
                            }]
                        },
                        { model: file }
                    ]
                }
            ]
        }]
    };

    await ConversationRepo.conversationUpdate(convoUserParams.searchParams, { lastMessageId: message.id });
    // await ConversationUserRepo.conversationUserUpdate({conversationId: conversationId}, {lastMessageId: message.id});

    // Find one user conversation message of conversation message id
    for (const receiverId of receivers) {
        messageParams.searchParams.userId = receiverId;
        messageParams.include[0].include[5].include[0].where.friendId = receiverId;
        let conversationMessageObject = await ConversationUserMessageRepo.conversationUserMessageDetail(messageParams);
        conversationMessageObject = conversationMessageObject.toJSON();
        /* if (conversationMessageObject.conversationMessage && conversationMessageObject.conversationMessage.text) {
            conversationMessageObject.conversationMessage.text = EncryptionService.decryptText(conversationMessageObject.conversationMessage.text);
        } */
        PUBNUB.publishMessage(_config.PUBNUB.USER_CHAT_CHANNEL.replace('{conversationId}', conversationMessageObject.conversationId).replace('{selfId}', receiverId), conversationMessageObject);
        let message = conversationMessageObject['conversationMessage']['text'];
        if (!conversationMessageObject['conversationMessage']['text']) {
            message = 'message';
        }
        const notificationData = {
            ...conversation,
            type: 'MESSAGE',
            title: sender.name,
            text: message
        };
        if (conversation.type === 'GROUP' && conversation.name) {
            notificationData.title = conversation.name + ' ' + sender.name;
        }
        if (messageData.postId) {
            notificationData['text'] = 'shared a publication';
        }

        NotificationHelper.sendNotification(receiverId, notificationData);
    }

    return new Promise(resolve => resolve(message));
}

async function sendMessageToUser (sender, receiverId, messageObj) {
    const ConversationRepo = require('app/Repositories/ConversationRepository');

    const convo = await ConversationRepo.conversationGetOrCreate({
        userId: sender.id,
        receiverId: receiverId,
        type: _appConstant.CHAT_TYPE_SINGLE
    });

    return sendMessageToGroup(convo.id, sender, messageObj);
}

async function conversationBulkMessageCreate (data) {
    return BaseRepo.baseBulkCreate(conversationMessage, data);
}

async function conversationMessageCreate (data) {
    /* if (data.text) {
        data.text = EncryptionService.encryptText(data.text);
    } */
    return BaseRepo.baseCreate(conversationMessage, data);
}

async function conversationMessageDetail (params) {
    return BaseRepo.baseDetail(conversationMessage, params);
}

async function conversationMessageUpdate (searchParams, data) {
    return BaseRepo.baseUpdate(conversationMessage, searchParams, data);
}

async function conversationMessageList (params) {
    return BaseRepo.baseList(conversationMessage, params);
}

async function conversationMessageDelete (searchParams) {
    return BaseRepo.baseDelete(conversationMessage, searchParams);
}
