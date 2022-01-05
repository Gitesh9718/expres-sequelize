/* global _appConstant, _errConstant */
'use strict';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('models');
const _ = require('lodash');

const { conversationMessage, file, user, post, conversationUser, friend, hashTag, postLike } = require('models');

const ConversationMessageRepo = require('app/Repositories/ConversationMessageRepository');
const ConversationUserMessageRepo = require('app/Repositories/ConversationUserMessageRepository');
const ConversationUserRepo = require('app/Repositories/ConversationUserRepository');
const ConversationRepo = require('app/Repositories/ConversationRepository');
// const EncryptionService = require('app/Services/EncryptionService');
// const NotificationHelper = require('app/Services/NotificationHelper');
const UserRepo = require('app/Repositories/UserRepository');
const PostRepo = require('app/Repositories/PostRepository');
const FriendRepo = require('app/Repositories/FriendRepository');
const CoinTransactionRepo = require('app/Repositories/CoinTransactionRepository');
const ConversationMessageRepository = require('../Repositories/ConversationMessageRepository');
const NotificationRepo = require('app/Repositories/NotificationRepository');
const BlockRepo = require('app/Repositories/BlockRepository');

const ConnectionService = require('app/Services/ConnectionService');
const UserDashboardService = require('app/Services/UserDashboardService');

module.exports = {
    conversationMessageList: conversationMessageList,
    store: store,
    recommend: recommend,
    postAsMessage: postAsMessage,
    deleteMessage: deleteMessage,
    deleteUserMessage: deleteUserMessage,
    markConversationDelivered: markConversationDelivered,
    forwardMessage: forwardMessage,
    unReadConversationMessageCount: unReadConversationMessageCount,
    selfIntroduceToGroup: selfIntroduceToGroup,
    acceptFriendRequestByMessageId: acceptFriendRequestByMessageId,
    getConversationPosts: getConversationPosts,
    pinUserMessage: pinUserMessage,
    unpinUserMessage: unpinUserMessage,
    getPinnedMessageList: getPinnedMessageList,
    V2ConversationMessageList: V2ConversationMessageList
};

async function markConversationDelivered (req, res, next) {
    await ConversationUserMessageRepo.conversationUserMessageUpdate({
        userId: req.user.id,
        conversationId: req.params.conversationId,
        status: 'SENT'
    }, { status: 'DELIVERED' });
    next();
}

async function conversationMessageList (req, res, next) {
    const messageParams = {
        searchParams: {
            userId: req.user.id,
            conversationId: req.params.conversationId
        },
        include: [
            {
                model: conversationMessage,
                include: [
                    {
                        model: conversationUser,
                        as: 'conversationUser',
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
                        attributes: _appConstant.USER_BASIC_INFO_FIELDS,
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
                                        attributes: { exclude: ['password'] },
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
                                where: { friendId: req.user.id },
                                required: false,
                                include: [
                                    {
                                        model: user,
                                        attributes: { exclude: ['password'] },
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
                                    { model: file },
                                    {
                                        model: file,
                                        as: 'audioFile'
                                    }
                                ]
                            },
                            {
                                model: user,
                                include: [{
                                    model: file,
                                    as: 'profileImage'
                                }]
                            },
                            { model: file },
                            {
                                model: file,
                                as: 'audioFile'
                            }
                        ]
                    }
                ]
            }
        ],
        order: [
            ['createdAt', 'DESC']
        ],
        limit: req.limit,
        offset: req.skip
    };

    try {
        let messages = await ConversationUserMessageRepo.conversationUserMessageList(messageParams);
        messages = messages.rows.reverse();
        const conversation = await ConversationRepo.conversationDetail({ id: req.params.conversationId });
        if (conversation.type === _appConstant.CHAT_TYPE_SINGLE) {
            await ConversationUserMessageRepo.updateUserMessage(req.params.conversationId, req.user.id);
        }
        res.data = { items: messages, paginate: { total: messages.length } };
        next();
    } catch (err) {
        next(err);
    }

    /* try {
        let newMessages = [];
        const messages = await ConversationUserMessageRepo.conversationUserMessageList(messageParams);
        messages.rows.forEach(msg => {
            msg = msg.toJSON();
            if (msg.conversationMessage && msg.conversationMessage.conversationUser && msg.conversationMessage.conversationUser.role) {
                msg.conversationMessage.user.role = msg.conversationMessage.conversationUser.role;
                delete msg.conversationMessage.conversationUser;
            }
            newMessages.push(msg);
        });

        newMessages = newMessages.reverse();
        const conversation = await ConversationRepo.conversationDetail({ id: req.params.conversationId });
        if (conversation.type === _appConstant.CHAT_TYPE_SINGLE) {
            await ConversationUserMessageRepo.updateUserMessage(req.params.conversationId, req.user.id);
            /!* ConversationUserMessageRepo.conversationUserMessageUpdate({
                 userId: {[Op.ne]: req.user.id},
                 conversationId: req.params.conversationId,
                 [Op.or]: [
                     {status: 'SENT'},
                     {status: 'DELIVERED'},
                 ]
             }, {status: 'READ'}); *!/
        }
        /!* let newMessages = [];
        let messageIds = [];

        messages.forEach(message => {
            message = message.toJSON();
            message['status'] = 'DELIVERED';

            newMessages.push(message);
        }); *!/

        res.data = {
            items: newMessages,
            paginate: { total: newMessages.length }
        };
        next();
    } catch (err) {
        next(err);
    } */
}

async function store (req, res, next) {
    const messageData = req.body;

    messageData['conversationId'] = req.params.conversationId;
    messageData['userId'] = req.user.id;

    try {
        const message = await ConversationMessageRepo.sendMessageToGroup(messageData['conversationId'], req.user, messageData);

        const messageParams = {
            searchParams: {
                userId: req.user.id,
                conversationMessageId: message.id
            },
            include: [{
                model: conversationMessage,
                include: [
                    { model: file },
                    { model: user },
                    {
                        model: user,
                        as: 'recommendUser'
                    },
                    {
                        model: user,
                        as: 'introducedUser'
                    },
                    {
                        model: user,
                        as: 'originalMessageCreator'
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
                        model: post,
                        include: [
                            {
                                model: post,
                                as: 'parentPost',
                                include: [
                                    { model: user },
                                    { model: file }
                                ]
                            },
                            { model: user },
                            { model: file }
                        ]
                    }
                ]
            }]
        };

        // messageParams.searchParams.userId = req.user.id;
        let userMessage = await ConversationUserMessageRepo.conversationUserMessageDetail(messageParams);
        userMessage = userMessage.toJSON();
        /* if (userMessage.conversationMessage && userMessage.conversationMessage.text) {
            userMessage.conversationMessage.text = EncryptionService.decryptText(userMessage.conversationMessage.text);
        } */
        if (messageData.hasOwnProperty('localId')) {
            userMessage['localId'] = messageData['localId'];
        }
        res.data = userMessage;

        next();
    } catch (err) {
        next(err);
    }
}

async function recommend (req, res, next) {
    const body = req.body;

    if (!body.hasOwnProperty('userIds')) {
        return next({
            message: _errConstant.REQUIRED_USER_IDS,
            status: 400
        });
    }
    body['userId'] = req.user.id;
    body['recommendUserId'] = req.params.userId;

    // throw error for blocked user
    // get block list
    const blockParams = {
        searchParams: {
            [Op.or]: [
                { userId: req.user.id, blockedUserId: req.params.userId },
                { userId: req.params.userId, blockedUserId: req.user.id }
            ]
        }
    };

    const blockData = await BlockRepo.blockDetail(blockParams);
    if (blockData && parseInt(blockData.userId) === parseInt(req.user.id)) {
        return next({
            message: _errConstant.RECOMMEND_FAILED_USER_BLOCKED,
            status: 400
        });
    } else if (blockData && parseInt(blockData.userId) === parseInt(req.params.userId)) {
        return next({
            message: _errConstant.RECOMMEND_FAILED_BLOCKED_BY_USER,
            status: 400
        });
    }

    // check for non blocked receivers
    const blockUserList = await BlockRepo.getAllBlockedUsers(req.user.id);
    // filter out valid receivers
    const receiverIds = _.difference(body.userIds, blockUserList);
    console.log('receivers --- ', receiverIds);

    for (const receiverId of receiverIds) {
        const messageObj = {
            recommendUserId: body['recommendUserId']
        };
        if (body.hasOwnProperty('message')) {
            messageObj['text'] = body.message;
        }
        await ConversationMessageRepo.sendMessageToUser(req.user, receiverId, messageObj);
    }

    // update users, give coins for introducing
    await UserRepo.userCoinsUpdate(req.user.id, _appConstant.INTRODUCE_COINS);

    // create coinTransaction log
    const coinTransactionObj = {
        userId: req.user.id,
        type: _appConstant.COINS_TRANSACTION_TYPE_INTRODUCE,
        typeId: body['recommendUserId'],
        coins: _appConstant.INTRODUCE_COINS
    };
    await CoinTransactionRepo.coinTransactionCreate(coinTransactionObj);

    next();
}

/* introduce yourself to the conversation group */
async function selfIntroduceToGroup (req, res, next) {
    const messageData = req.body;
    messageData['conversationId'] = req.params.conversationId;
    messageData['userId'] = req.user.id;
    messageData['introducedUserId'] = req.user.id;

    try {
        const message = await ConversationMessageRepo.sendMessageToGroup(messageData['conversationId'], req.user, messageData);
        const messageParams = {
            searchParams: {
                userId: req.user.id,
                conversationMessageId: message.id
            },
            include: [{
                model: conversationMessage,
                include: [
                    { model: file },
                    { model: user },
                    {
                        model: user,
                        as: 'recommendUser'
                    },
                    {
                        model: user,
                        as: 'introducedUser'
                    },
                    {
                        model: user,
                        as: 'originalMessageCreator'
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
                        model: post,
                        include: [
                            {
                                model: post,
                                as: 'parentPost',
                                include: [
                                    { model: user },
                                    { model: file }
                                ]
                            },
                            { model: user },
                            { model: file }
                        ]
                    }
                ]
            }]
        };

        let userMessage = await ConversationUserMessageRepo.conversationUserMessageDetail(messageParams);
        userMessage = userMessage.toJSON();

        res.data = userMessage;
        return next();
    } catch (err) {
        return next(err);
    }
}

async function postAsMessage (req, res, next) {
    const body = req.body;
    const conversationIds = [];
    let forwardToConvoType = null;

    if (!body.hasOwnProperty('userIds')) {
        return next({
            message: _errConstant.REQUIRED_USER_IDS,
            status: 400
        });
    }

    body['userId'] = req.user.id;
    body['postId'] = req.params.postId;
    const messageObj = {
        postId: body['postId']
    };
    if (body.hasOwnProperty('message')) {
        messageObj['text'] = body.message;
    }

    try {
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.postId } });
        if (!originalPost) {
            return next({ message: _errConstant.NO_PUBLICATION, status: 400 });
        }
        // check for non blocked receivers
        const blockUserList = await BlockRepo.getAllBlockedUsers(req.user.id);
        // filter out valid receivers
        const receiverIds = _.difference(body.userIds, blockUserList);

        for (const receiverId of receiverIds) {
            const message = await ConversationMessageRepo.sendMessageToUser(req.user, receiverId, messageObj);
            conversationIds.push(message.conversationId);
        }

        let totalForwards = receiverIds.length;

        if (body.hasOwnProperty('groupIds')) {
            // update totalForwards length
            totalForwards = totalForwards + body.groupIds.length;

            for (const groupId of body.groupIds) {
                const message = await ConversationMessageRepo.sendMessageToGroup(groupId, req.user, messageObj);
                conversationIds.push(message.conversationId);
            }
        }

        // check for forward to convo type
        if (receiverIds.length) {
            forwardToConvoType = 'SINGLE';
        } else if (body.hasOwnProperty('groupIds') && body.groupIds.length) {
            forwardToConvoType = 'GROUP';
        }

        // increment forwarded count by totalGroups length
        await PostRepo.postUpdate({ id: req.params.postId }, {
            forwardedCount: Sequelize.literal(`forwardedCount + ${totalForwards}`),
            forwardToConvoType: forwardToConvoType
        });

        // Post forwarded event trigger for user dashboard
        const eventData = {
            userId: originalPost.userId,
            type: _appConstant.DASHBOARD_POST_FORWARDED,
            postId: req.params.postId
        };

        UserDashboardService.DailyPostDashboardDataCreateORIncrement(eventData, totalForwards);

        res.data = { conversationIds };
        next();
    } catch (err) {
        return next(err);
    }
}

async function deleteMessage (req, res, next) {
    try {
        const message = await ConversationMessageRepo.conversationMessageDetail({
            searchParams: {
                id: req.params.messageId
            }
        });

        if (!message) {
            return next({
                message: _errConstant.NO_MESSAGE,
                status: 400
            });
        }

        if (message.userId !== req.user.id) {
            return next({
                message: _errConstant.NO_AUTH,
                status: 400
            });
        }

        await ConversationMessageRepo.conversationMessageDelete({ id: req.params.messageId });
        await ConversationUserMessageRepo.conversationUserMessageDelete({ conversationMessageId: req.params.messageId });

        // update lastMessage for each users in conversation
        const convoUser = await ConversationUserRepo.conversationUserList({ searchParams: { conversationId: req.params.conversationId } });
        for (const user of convoUser) {
            db.sequelize.query(`UPDATE conversationUsers SET lastMessageId = (SELECT MAX(conversationMessageId) FROM conversationUserMessages WHERE conversationId= ${user.conversationId} AND userId = ${user.userId} AND deletedAt IS null) WHERE conversationId = ${user.conversationId} AND userId = ${user.userId}`);
        }
        next();
    } catch (err) {
        next(err);
    }
}

async function deleteUserMessage (req, res, next) {
    try {
        const message = await ConversationUserMessageRepo.conversationUserMessageDetail({
            searchParams: {
                conversationId: req.params.conversationId,
                conversationMessageId: req.params.messageId,
                id: req.params.userMessageId
            }
        });

        if (!message) {
            return next({
                message: _errConstant.NO_MESSAGE,
                status: 400
            });
        }

        if (message.userId !== req.user.id) {
            return next({
                message: _errConstant.NO_AUTH,
                status: 400
            });
        }

        await ConversationUserMessageRepo.conversationUserMessageDelete({ id: req.params.userMessageId });

        // update lastMessage for each users in conversation
        await db.sequelize.query(`UPDATE conversationUsers SET lastMessageId = (SELECT MAX(conversationMessageId) FROM conversationUserMessages WHERE conversationId= ${message.conversationId} AND userId = ${message.userId} AND deletedAt IS null) WHERE conversationId = ${message.conversationId} AND userId = ${message.userId}`);

        next();
    } catch (err) {
        next(err);
    }
}

async function forwardMessage (req, res, next) {
    if (!req.body.conversationIds || !Array.isArray(req.body.conversationIds) || req.body.conversationIds.length === 0) {
        return next({
            message: _errConstant.REQUIRED_RECIEVERS,
            status: 400
        });
    }

    try {
        await ConversationMessageRepo.forwardMessage(req.body.conversationIds, req.params.messageId, req.user);
        next();
    } catch (error) {
        next(error);
    }
}

// unread message count
async function unReadConversationMessageCount (req, res, next) {
    const loggedInUsr = req.user;
    const data = { unreadMsgCount: 0 };

    try {
        const convoList = await ConversationUserRepo.conversationUserList({ searchParams: { userId: loggedInUsr.id } });
        const conversationIds = [];
        convoList.forEach(conv => {
            conversationIds.push(conv.conversationId);
        });

        const convoMsg = await ConversationMessageRepo.conversationMessageList({
            searchParams: {
                conversationId: conversationIds,
                userId: { [Op.ne]: loggedInUsr.id }
            }
        });
        const msgIds = [];

        convoMsg.forEach(msg => {
            msgIds.push(msg.id);
        });

        if (msgIds.length) {
            const messageCount = await ConversationUserMessageRepo.conversationUserMessageCount({
                conversationMessageId: msgIds,
                userId: loggedInUsr.id,
                status: { [Op.ne]: 'READ' }
            });

            if (messageCount >= 0) {
                data.unreadMsgCount = messageCount;
            }
        }

        res.data = { data };

        return next();
    } catch (err) {
        return next(err);
    }
}

/* Accept friend request of introduced user in conversation group */

async function acceptFriendRequestByMessageId (req, res, next) {
    const user = req.user;
    let inviter;
    const coinTransactionData = [];

    try {
        const friendCount = await FriendRepo.friendCount({ userId: user.id });
        /* check max friend limit exceeds */
        if (friendCount >= _appConstant.MAX_FRIENDS) {
            return next({
                message: _errConstant.MAX_FRIEND_LIMIT,
                status: 400
            });
        }

        const message = await ConversationMessageRepository.conversationMessageDetail({
            searchParams: {
                conversationId: req.params.conversationId,
                id: req.params.messageId
            }
        });

        if (!message) {
            return next({
                message: _errConstant.NO_MESSAGE,
                status: 400
            });
        }

        /* get details of recommended user */
        inviter = await UserRepo.userDetail({ searchParams: { id: message['introducedUserId'] } });

        if (!inviter) {
            return next({
                message: _errConstant.NO_USER,
                status: 400
            });
        }

        // check if your self
        if (user.id === inviter.id) {
            return next({
                message: _errConstant.SELF_INVITE_ACCEPT,
                status: 400
            });
        }

        // check if already a friend
        const friendParam = {
            searchParams: {
                [Op.and]: [{ userId: user.id }, { friendId: inviter.id }]
            }
        };
        const isFriend = await FriendRepo.friendDetail(friendParam);
        if (isFriend) {
            return next({
                message: _errConstant.ALREADY_CONTACT,
                status: 409
            }, null);
        }

        /* create friends */
        const friendData = [
            {
                userMetaId: user.userMetaId,
                userId: user.id,
                friendMetaId: inviter.userMetaId,
                friendId: inviter.id
            },
            {
                userMetaId: inviter.userMetaId,
                userId: inviter.id,
                friendMetaId: user.userMetaId,
                friendId: user.id
            }
        ];

        await FriendRepo.friendBulkCreate(friendData);

        // update user repo coz invitation accept for referral user
        await UserRepo.userCoinsUpdate(inviter.id, _appConstant.INVITATION_ACCEPTED_COINS);

        coinTransactionData.push({
            userId: inviter.id,
            type: _appConstant.COINS_TRANSACTION_TYPE_INVITATION_ACCEPT,
            coins: _appConstant.INVITATION_ACCEPTED_COINS
        });

        // get all first degree friends of invitation sender to allocate coins
        const firstDegreeFriends = await FriendRepo.friendList({
            searchParams: {
                userId: inviter.id,
                friendId: { [Op.ne]: inviter.id }
            }
        });
        const friendIds = [];
        firstDegreeFriends.forEach(frnd => {
            friendIds.push(frnd.friendId);
            coinTransactionData.push(
                {
                    userId: frnd.friendId,
                    type: _appConstant.COINS_TRANSACTION_TYPE_FRIEND_INVITATION_ACCEPT,
                    coins: _appConstant.FRIEND_INVITATION_ACCEPTED_COINS
                }
            );
        });

        await UserRepo.userCoinsUpdate(friendIds, _appConstant.FRIEND_INVITATION_ACCEPTED_COINS);
        // create coinTransaction log
        await CoinTransactionRepo.coinTransactionBulkCreate(coinTransactionData);

        await NotificationRepo.notificationCreate({
            type: _appConstant.NOTIFICATION_TYPE_INVITATION_ACCEPT,
            actionOwnerId: user.id,
            userId: inviter.id,
            text: req.user.name + ' accepted your invitation'
        });

        console.log('### CREATING CONNECTIONS FOR userId %s with inviterId %s FROM ACCEPT-WITH-MESSAGE-ID', user.id, inviter.id);
        // mapping connections
        ConnectionService.createConnections(inviter.id, user.id);

        return next();
    } catch (err) {
        return next(err);
    }
}

/* get all  posts from a conversation */

async function getConversationPosts (req, res, next) {
    const messageParam = {
        searchParams: {
            conversationId: req.params.conversationId,
            postId: { [Op.ne]: null }
        },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('postId')), 'postId']]
    };

    try {
        const messages = await ConversationMessageRepo.conversationMessageList(messageParam);
        const postIds = [];
        messages.forEach(msg => {
            postIds.push(msg.postId);
        });

        if (!postIds.length) {
            res.data = {
                items: [],
                paginate: { total: 0 }
            };
            next();
            return;
        }

        const postParams = {
            searchParams: { id: postIds },
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
                        { model: hashTag },
                        { model: file },
                        {
                            model: file,
                            as: 'audioFile'
                        }
                    ]
                },
                {
                    model: user,
                    include: [{
                        model: file,
                        as: 'profileImage'
                    }]
                },
                {
                    model: user,
                    as: 'isFavourite'
                },
                {
                    model: postLike,
                    as: 'liked',
                    where: { userId: req.user.id },
                    required: false
                },
                { model: hashTag },
                { model: file },
                {
                    model: file,
                    as: 'audioFile'
                }
            ],
            limit: req.limit,
            offset: req.skip
        };

        // check for blocked users
        const blockUserList = await BlockRepo.getAllBlockedUsers(req.user.id);
        if (blockUserList.length) {
            postParams.searchParams['userId'] = { [Op.notIn]: blockUserList };
        }

        const posts = await PostRepo.postList(postParams);

        const newPosts = [];

        posts.rows.forEach(p => {
            p = p.toJSON();
            p['isFavourite'] = !!p['isFavourite'].length;
            p['liked'] = false;
            newPosts.push(p);
        });

        res.data = {
            items: newPosts,
            paginate: { total: posts.count }
        };
        return next();
    } catch (err) {
        next(err);
    }
}

/* pin a user message */

async function pinUserMessage (req, res, next) {
    try {
        const message = await ConversationUserMessageRepo.conversationUserMessageDetail({
            searchParams: {
                conversationId: req.params.conversationId,
                conversationMessageId: req.params.messageId,
                id: req.params.userMessageId
            }
        });

        if (!message) {
            return next({
                message: _errConstant.NO_MESSAGE,
                status: 400
            });
        }

        if (message.userId !== req.user.id) {
            return next({
                message: _errConstant.NO_AUTH,
                status: 400
            });
        }

        await ConversationUserMessageRepo.conversationUserMessageUpdate({
            conversationId: message.conversationId,
            conversationMessageId: message.conversationMessageId
        }, { isPinnedMessage: true });

        return next();
    } catch (err) {
        return next(err);
    }
}

/* unpin a user message */

async function unpinUserMessage (req, res, next) {
    try {
        const message = await ConversationUserMessageRepo.conversationUserMessageDetail({
            searchParams: {
                conversationId: req.params.conversationId,
                conversationMessageId: req.params.messageId,
                id: req.params.userMessageId
            }
        });

        if (!message) {
            return next({
                message: _errConstant.NO_MESSAGE,
                status: 400
            });
        }

        if (message.userId !== req.user.id) {
            return next({
                message: _errConstant.NO_AUTH,
                status: 400
            });
        }

        await ConversationUserMessageRepo.conversationUserMessageUpdate({
            conversationId: message.conversationId,
            conversationMessageId: message.conversationMessageId
        }, { isPinnedMessage: false });

        return next();
    } catch (err) {
        return next(err);
    }
}

/* pinned message list */

async function getPinnedMessageList (req, res, next) {
    const messageParams = {
        searchParams: {
            userId: req.user.id,
            conversationId: req.params.conversationId,
            isPinnedMessage: true
        },
        include: { model: conversationMessage },

        limit: req.limit,
        offset: req.skip
    };
    try {
        const messages = await ConversationUserMessageRepo.conversationUserMessageList(messageParams);

        res.data = {
            items: messages.rows,
            paginate: { total: messages.count }
        };

        return next();
    } catch (err) {
        return next(err);
    }
}

/*  ############################                  ##################################
                                  VERSION-2 APIS
    #############################                 ################################ */

async function V2ConversationMessageList (req, res, next) {
    const messageParams = {
        searchParams: {
            userId: req.user.id,
            conversationId: req.params.conversationId
        },
        include: [
            {
                model: conversationMessage,
                include: [
                    {
                        model: conversationUser,
                        as: 'conversationUser',
                        attributes: ['role'],
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
                        attributes: _appConstant.USER_BASIC_INFO_FIELDS,
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
                                where: { friendId: req.user.id },
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
                        attributes: _appConstant.USER_BASIC_INFO_FIELDS,
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
                                    { model: file },
                                    {
                                        model: file,
                                        as: 'audioFile'
                                    }
                                ]
                            },
                            {
                                model: user,
                                include: [{
                                    model: file,
                                    as: 'profileImage'
                                }]
                            },
                            { model: file },
                            {
                                model: file,
                                as: 'audioFile'
                            }
                        ]
                    }
                ]
            }
        ],
        order: [
            ['createdAt', 'DESC']
        ],
        limit: req.limit,
        offset: req.skip
    };

    try {
        let newMessages = [];
        const messages = await ConversationUserMessageRepo.conversationUserMessageList(messageParams);
        messages.rows.forEach(msg => {
            msg = msg.toJSON();
            if (msg.conversationMessage && msg.conversationMessage.conversationUser && msg.conversationMessage.conversationUser.role) {
                msg.conversationMessage.user.role = msg.conversationMessage.conversationUser.role;
                delete msg.conversationMessage.conversationUser;
            }
            newMessages.push(msg);
        });

        newMessages = newMessages.reverse();
        const conversation = await ConversationRepo.conversationDetail({ id: req.params.conversationId });
        if (conversation.type === _appConstant.CHAT_TYPE_SINGLE) {
            await ConversationUserMessageRepo.updateUserMessage(req.params.conversationId, req.user.id);
        }

        res.data = { items: newMessages, paginate: { total: newMessages.length } };
        next();
    } catch (err) {
        next(err);
    }
}
