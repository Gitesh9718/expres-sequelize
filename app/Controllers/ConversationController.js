/* global _appConstant, _errConstant */
'use strict';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const _ = require('lodash');

const { user, friend, conversationUser, conversationMessage, file, conversationUserMessage } = require('models');
const ConversationRepo = require('app/Repositories/ConversationRepository');
const ConversationUserRepo = require('app/Repositories/ConversationUserRepository');
const ConversationUserMessageRepo = require('app/Repositories/ConversationUserMessageRepository');
const FriendRepo = require('app/Repositories/FriendRepository');
const ChatRequestRepo = require('app/Repositories/ChatRequestRepository');
// const EncryptionService = require('app/Services/EncryptionService');
const NotificationRepo = require('app/Repositories/NotificationRepository');
const moment = require('moment');

module.exports = {
    store: store,
    conversationUpdate: conversationUpdate,
    leaveGroup: leaveGroup,
    conversationDelete: conversationDelete,
    muteGroup: muteGroup,
    unmuteGroup: unmuteGroup,
    conversationList: conversationList,
    createGroupConversation: createGroupConversation,
    conversationDetail: conversationDetail,
    V2ConversationList: V2ConversationList,
    getConversationMembers: getConversationMembers
};

async function store (req, res, next) {
    if (req.body.type === _appConstant.CHAT_TYPE_GROUP) {
        await createGroupConversation(req, res, next);
    } else {
        await createConversation(req, res, next);
    }
}

async function conversationUpdate (req, res, next) {
    console.log('######### CONVERSATION UPDATE DATE ========> ', new Date());
    const body = req.body;
    const convoDetail = await ConversationRepo.conversationDetail({ searchParams: { id: req.params.conversationId } });
    if (!convoDetail) {
        return next({
            message: _errConstant.NO_GROUP,
            status: 400
        });
    }
    if (convoDetail && convoDetail.type !== _appConstant.CHAT_TYPE_GROUP) {
        return next({
            message: _errConstant.NO_GROUP,
            status: 400
        });
    }
    if (!body.receiverIds || !Array.isArray(body.receiverIds) || body.receiverIds.length === 0) {
        return next({
            message: _errConstant.REQUIRED_RECIEVERS,
            status: 400
        });
    }
    if (body.receiverIds.length < 2) {
        return next({
            message: _errConstant.CONVERSATION_MIN_RECEIVER,
            status: 400
        });
    }
    console.log('######### BFORE UPDATE (INPUT) ========> ', body);
    try {
        // updating conversation
        await ConversationRepo.conversationUpdate({ id: req.params.conversationId }, req.body);

        // updating receivers
        const receiverIds = _.uniq(body.receiverIds);
        const deletedUserIds = [];
        console.log('######### DISTINCT INPUT RECEIVER ========> ', receiverIds);

        // getting existing users
        const convoUsers = await ConversationUserRepo.conversationUserList({ searchParams: { conversationId: req.params.conversationId } });

        // if user not exist in the receiverIds then pushed it to deletedUserIds else remove it from receivers ids
        convoUsers.forEach(convoUser => {
            convoUser = convoUser.toJSON();
            const index = receiverIds.indexOf(convoUser.userId);
            if (index === -1) {
                deletedUserIds.push(convoUser.userId);
            } else {
                receiverIds.splice(index, 1);
            }
        });

        // deleted users
        if (deletedUserIds.length) {
            await ConversationUserRepo.conversationUserDelete({
                conversationId: convoDetail.id,
                userId: { [Op.in]: deletedUserIds }
            });
        }
        if (receiverIds.length) {
            await ConversationRepo.addUsersInConversation({ receiverIds }, convoDetail);
        }

        let newAdminIds = [];
        if (body.groupAdminIds && body.groupAdminIds.length) {
            const admins = await ConversationUserRepo.conversationUserList({ searchParams: { [Op.and]: [{ conversationId: req.params.conversationId }, { role: _appConstant.CHAT_ROLE_ADMIN }] } });
            const groupAdminIds = _.uniq(body.groupAdminIds);
            const removedAdminIds = [];
            // new admins
            admins.forEach(admin => {
                admin = admin.toJSON();
                const index = groupAdminIds.indexOf(admin.userId);
                if (index === -1) {
                    removedAdminIds.push(admin.userId);
                } else {
                    groupAdminIds.splice(index, 1);
                }
            });
            // update newAdminIds
            newAdminIds = groupAdminIds;

            console.log('##### newAdmins #### ', newAdminIds);
            console.log('##### removedAdmins #### ', removedAdminIds);

            if (removedAdminIds.length) {
                await ConversationUserRepo.conversationUserUpdate({
                    conversationId: convoDetail.id,
                    userId: { [Op.in]: removedAdminIds }
                }, { role: _appConstant.CHAT_ROLE_USER });
            }

            await ConversationUserRepo.conversationUserUpdate({
                conversationId: convoDetail.id,
                userId: { [Op.in]: body.groupAdminIds }
            }, { role: _appConstant.CHAT_ROLE_ADMIN });
        }

        const updatedConvoUser = await ConversationUserRepo.conversationUserList({
            searchParams: { conversationId: req.params.conversationId },
            attributes: ['userId', 'role'],
            isRaw: true
        });
        console.log('######## UPDATED RECEIVERS =======> ', updatedConvoUser);

        // send notification only to new admins
        if (newAdminIds.length) {
            newAdminIds.forEach(id => {
                NotificationRepo.notificationCreate({
                    type: _appConstant.NOTIFICATION_TYPE_NEW_GROUP_ADMIN,
                    typeId: convoDetail.id,
                    actionOwnerId: req.user.id,
                    userId: id,
                    text: req.user.name + ' appointed you as a new admin of chat group "' + convoDetail.name + '"'
                });
            });
        }
        next();
    } catch (err) {
        next(err);
    }
}

async function leaveGroup (req, res, next) {
    let newAdminId = null;
    try {
        const convoDetail = await ConversationRepo.conversationDetail({ searchParams: { id: req.params.conversationId } });
        if (!convoDetail) {
            return next({
                message: _errConstant.NO_GROUP,
                status: 400
            });
        }
        if (convoDetail && convoDetail.type !== _appConstant.CHAT_TYPE_GROUP) {
            return next({
                message: _errConstant.NO_GROUP,
                status: 400
            });
        }
        const conversationUser = await ConversationUserRepo.conversationUserDetail({
            searchParams: {
                conversationId: convoDetail.id,
                userId: req.user.id
            }
        });
        if (conversationUser['role'] === _appConstant.CHAT_ROLE_ADMIN) {
            const newConvoUser = await ConversationUserRepo.conversationUserList({
                searchParams: {
                    conversationId: convoDetail.id,
                    role: { [Op.ne]: 'ADMIN' }
                },
                limit: 1
            });
            console.log('new usr ', newConvoUser.rows[0].userId);
            newAdminId = newConvoUser.rows[0].userId;

            if (newAdminId) {
                await ConversationUserRepo.conversationUserUpdate({
                    searchParams: {
                        conversationId: convoDetail.id,
                        userId: newAdminId
                    }
                }, { role: _appConstant.CHAT_ROLE_ADMIN });
            }
        }

        await ConversationUserRepo.conversationUserDelete({
            conversationId: convoDetail.id,
            userId: req.user.id
        });

        // send notification to new admin
        if (newAdminId) {
            NotificationRepo.notificationCreate({
                type: _appConstant.NOTIFICATION_TYPE_NEW_GROUP_ADMIN,
                typeId: convoDetail.id,
                actionOwnerId: req.user.id,
                userId: newAdminId,
                text: 'You are now an admin of chat group "' + convoDetail.name + '"'
            });
        }

        next();
    } catch (err) {
        next(err);
    }
}

async function muteGroup (req, res, next) {
    const body = req.body;
    if (!body.duration || isNaN(parseInt(body.duration))) {
        return next({
            message: _errConstant.REQUIRED_DURATION,
            status: 400
        });
    }

    try {
        const convoDetail = await ConversationRepo.conversationDetail({ searchParams: { id: req.params.conversationId } });
        if (!convoDetail) {
            return next({
                message: _errConstant.NO_GROUP,
                status: 400
            });
        }
        /* if (convoDetail && convoDetail.type !== _appConstant.CHAT_TYPE_GROUP) {
            return next({message: 'Group not found', status: 400});
        } */
        await ConversationUserRepo.conversationUserUpdate({
            conversationId: convoDetail.id,
            userId: req.user.id
        }, {
            muteOn: moment(),
            muteDuration: parseInt(body.duration)
        });

        next();
    } catch (err) {
        next(err);
    }
}

async function unmuteGroup (req, res, next) {
    try {
        const convoDetail = await ConversationRepo.conversationDetail({ searchParams: { id: req.params.conversationId } });
        if (!convoDetail) {
            return next({
                message: _errConstant.NO_GROUP,
                status: 400
            });
        }
        /* if (convoDetail && convoDetail.type !== _appConstant.CHAT_TYPE_GROUP) {
            return next({message: 'Group not found', status: 400});
        } */
        await ConversationUserRepo.conversationUserUpdate({
            conversationId: convoDetail.id,
            userId: req.user.id
        }, {
            muteOn: null,
            muteDuration: 0
        });

        next();
    } catch (err) {
        next(err);
    }
}

async function createConversation (req, res, next) {
    const body = req.body;
    if (!body.receiverId) {
        return next({
            message: _errConstant.REQUIRED_A_RECIEVER,
            status: 400
        });
    }
    body['userId'] = req.user.id;
    const friendParams = {
        searchParams: {
            userId: req.user.id,
            friendId: body.receiverId
        }
    };

    try {
        const sysFriend = await FriendRepo.friendDetail(friendParams);

        if (!sysFriend) {
            const request = await ChatRequestRepo.chatRequestDetail({
                searchParams: {
                    requestedUserId: body.receiverId,
                    userId: req.user.id
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            if (!request || (request && request.status !== 'APPROVED')) {
                return next({
                    message: _errConstant.CONVO_CANT_INITIATE,
                    status: 400
                });
            }
        }
        body['type'] = _appConstant.CHAT_TYPE_SINGLE;
        body.createdBy = req.user.id;

        const convo = await ConversationRepo.conversationGetOrCreate(body);

        res.data = convo.toJSON();
        next();
    } catch (err) {
        next(err);
    }
}

async function conversationDetail (req, res, next) {
    const conParams = {
        searchParams: { id: req.params.id },
        include: [
            {
                model: file,
                as: 'image'
            },
            {
                model: conversationUser,
                as: 'conversationUser',
                where: { userId: req.user.id },
                include: [
                    {
                        model: user,
                        attributes: ['id', 'name', 'image', 'publicKey', 'privateKey'],
                        include: [{
                            model: file,
                            as: 'profileImage'
                        }]
                    }
                ]
            },
            {
                model: conversationUser,
                as: 'conversationReceiver',
                where: { userId: { [Op.ne]: req.user.id } },
                include: [
                    {
                        model: user,
                        attributes: ['id', 'name', 'image', 'publicKey', 'privateKey'],
                        include: [{
                            model: file,
                            as: 'profileImage'
                        }]
                    }
                ]
            },
            {
                model: conversationUser,
                as: 'conversationReceivers',
                where: { userId: { [Op.ne]: req.user.id } },
                include: [
                    {
                        model: user,
                        attributes: ['id', 'name', 'image', 'city', 'country', 'about', 'publicKey', 'privateKey'],
                        include: [{
                            model: file,
                            as: 'profileImage'
                        }]
                    }
                ]
            },
            {
                model: conversationMessage,
                as: 'lastMessage'
            }
        ],
        order: [
            ['lastMessageId', 'DESC']
        ],
        group: ['id']
    };

    try {
        const conversation = await ConversationRepo.conversationDetail(conParams);

        res.data = { data: conversation.toJSON() };
        next();
    } catch (err) {
        next(err);
    }
}

async function conversationList (req, res, next) {
    let isNew = false;
    // check for isNew param
    if (req.searchQuery.isNew && req.searchQuery.isNew === 'true') {
        isNew = true;
    }

    // Introduce group is also considered in SINGLE conversation
    // add type filter if received from params
    let searchFilter = {};
    if (req.searchQuery.type) {
        if (req.searchQuery.type === 'SINGLE') {
            searchFilter = {
                [Op.or]: [
                    {
                        type: 'SINGLE'
                    },
                    {
                        groupType: 'introduce'
                    }
                ]
            };
        } else {
            searchFilter['type'] = req.searchQuery.type;
            searchFilter['groupType'] = null;
        }
    }

    // search by groupname/username
    if (req.searchQuery.name && req.searchQuery.type && req.searchQuery.type === 'GROUP') {
        searchFilter['id'] = await ConversationRepo.getSearchedGroupConversations(req.searchQuery.name);
    } else if (req.searchQuery.name && req.searchQuery.type && req.searchQuery.type === 'SINGLE') {
        searchFilter['id'] = await ConversationRepo.getSearchedSingleConversations(req.searchQuery.name, req.user.id);
    } else if (req.searchQuery.name && !req.searchQuery.type) {
        searchFilter['id'] = await ConversationRepo.getSearchedConversations(req.searchQuery.name, req.user.id);
    }

    // check for isNew flag
    if (isNew) {
        const conParams = {
            searchParams: searchFilter,
            include: [
                {
                    model: file,
                    as: 'image'
                },
                {
                    model: user,
                    as: 'createdByUser'
                },
                {
                    model: conversationUser,
                    as: 'conversationUser',
                    where: { userId: req.user.id },
                    include: [
                        {
                            model: user,
                            attributes: ['id', 'name', 'image', 'city', 'country', 'about', 'publicKey', 'privateKey'],
                            include: [{
                                model: file,
                                as: 'profileImage'
                            }]
                        },
                        {
                            model: conversationMessage,
                            as: 'lastMessage',
                            include: [
                                {
                                    model: conversationUserMessage,
                                    attributes: ['status'],
                                    where: { userId: req.user.id },
                                    required: false
                                },
                                {
                                    model: user,
                                    attributes: _appConstant.USER_BASIC_INFO_FIELDS,
                                    include: [{
                                        model: file,
                                        as: 'profileImage'
                                    }]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: conversationUser,
                    as: 'conversationReceiver',
                    where: { userId: { [Op.ne]: req.user.id } },
                    include: [
                        {
                            model: user,
                            attributes: ['id', 'name', 'image', 'publicKey', 'privateKey'],
                            include: [{
                                model: file,
                                as: 'profileImage'
                            }]
                        }
                    ]
                },
                {
                    model: conversationUser,
                    as: 'conversationReceivers',
                    where: { userId: { [Op.ne]: req.user.id } },
                    include: [
                        {
                            model: user,
                            attributes: ['id', 'name', 'image', 'city', 'country', 'about', 'publicKey', 'privateKey'],
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
                        }
                    ]
                }
            ],
            order: [
                // ['lastMessageId', 'DESC'],
                ['updatedAt', 'DESC']
            ],
            limit: 100,
            offset: 0
        };

        try {
            const conversations = await ConversationRepo.conversationList(conParams);
            let newConversations = [];

            conversations.rows.forEach(conversation => {
                conversation = conversation.toJSON();
                // remove SINGLE type conversation with lastmessageId null
                if (!(conversation.type === 'SINGLE' && conversation.conversationUser.lastMessageId === null)) {
                    newConversations.push(conversation);
                }
            });

            newConversations.forEach(conversation => {
                conversation.isMute = false;

                if (conversation.conversationUser && conversation.conversationUser.muteOn && conversation.conversationUser.muteDuration) {
                    conversation.isMute = moment(conversation.conversationUser.muteOn).add(conversation.conversationUser.muteDuration, 'h').isAfter(moment());
                }
                /* last message update for each conversation */
                if (conversation.conversationUser.lastMessage && conversation.conversationUser.lastMessage.conversationUserMessages.length) {
                    conversation.conversationUser.lastMessage.status = conversation.conversationUser.lastMessage.conversationUserMessages[0].status;
                    delete conversation.conversationUser.lastMessage.conversationUserMessages;

                    conversation.lastMessage = conversation.conversationUser.lastMessage;
                } else {
                    conversation.lastMessage = null;
                }

                /* if (row.lastMessage && row.lastMessage.text) {
                        row.lastMessage.text = EncryptionService.decryptText(row.lastMessage.text);
                    } */
            });

            /* apply limit & skip */
            newConversations = newConversations.slice(req.skip, req.limit + req.skip);

            res.data = {
                items: newConversations,
                paginate: { total: newConversations.length }
            };
            next();
        } catch (err) {
            next(err);
        }
    } else {
        const conParams = {
            searchParams: searchFilter,
            include: [
                {
                    model: file,
                    as: 'image'
                },
                {
                    model: user,
                    as: 'createdByUser'
                },
                {
                    model: conversationUser,
                    as: 'conversationUser',
                    where: { userId: req.user.id },
                    include: [
                        {
                            model: user,
                            attributes: ['id', 'name', 'image', 'publicKey', 'privateKey'],
                            include: [{
                                model: file,
                                as: 'profileImage'
                            }]
                        }
                    ]
                },
                {
                    model: conversationUser,
                    as: 'conversationReceiver',
                    where: { userId: { [Op.ne]: req.user.id } },
                    include: [
                        {
                            model: user,
                            attributes: ['id', 'name', 'image', 'publicKey', 'privateKey'],
                            include: [{
                                model: file,
                                as: 'profileImage'
                            }]
                        }
                    ]
                },
                {
                    model: conversationUser,
                    as: 'conversationReceivers',
                    where: { userId: { [Op.ne]: req.user.id } },
                    include: [
                        {
                            model: user,
                            attributes: ['id', 'name', 'image', 'publicKey', 'privateKey'],
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
                        }
                    ]
                },
                {
                    model: conversationMessage,
                    as: 'lastMessage'
                    /* include: [
                            {model: conversationUserMessage, where: {userId: req.user.id}}
                        ] */
                }
            ],
            order: [
                // ['lastMessageId', 'DESC'],
                ['updatedAt', 'DESC']
            ],
            group: ['id'],
            limit: req.limit,
            offset: req.skip
        };

        try {
            const conversations = await ConversationRepo.conversationList(conParams);
            const newConversations = [];
            const messageIds = [];
            conversations.rows.forEach(conversation => {
                conversation = conversation.toJSON();
                if (!conversation.lastMessage) {
                    conversation.lastMessage = {};
                }
                conversation.isMute = false;
                if (conversation.lastMessage) {
                    messageIds.push(conversation.lastMessage.id);
                    conversation.lastMessage.status = 'SENT';
                }
                /* if (conversation.conversationUser && conversation.conversationUser.muteOn && conversation.conversationUser.muteDuration) {
                        conversation.isMute = moment(conversation.conversationUser.muteOn).add(conversation.conversationUser.muteDuration, "h").isAfter(moment());
                    }
                    if (conversation.lastMessage && conversation.lastMessage.conversationUserMessages && conversation.lastMessage.conversationUserMessages.length) {
                        conversation.lastMessage.status = conversation.lastMessage.conversationUserMessages[0].status;
                        delete conversation.lastMessage.conversationUserMessages;
                    } */
                /* if (row.lastMessage && row.lastMessage.text) {
                        row.lastMessage.text = EncryptionService.decryptText(row.lastMessage.text);
                    } */
                newConversations.push(conversation);
            });

            if (messageIds.length) {
                const messageMap = {};
                const messages = await ConversationUserMessageRepo.conversationUserMessageList({
                    searchParams: {
                        conversationMessageId: { [Op.in]: messageIds },
                        userId: req.user.id
                    }
                });
                messages.forEach(message => {
                    messageMap[message.conversationMessageId] = message.status;
                });
                newConversations.forEach(conversation => {
                    if (conversation.lastMessage && Object.prototype.hasOwnProperty.call(messageMap, conversation.lastMessage.id)) {
                        conversation.lastMessage.status = messageMap[conversation.lastMessage.id];
                    }
                });
            }

            res.data = {
                items: newConversations,
                paginate: { total: conversations.count }
            };
            next();
        } catch (err) {
            next(err);
        }
    }
}

async function createGroupConversation (req, res, next) {
    const body = req.body;
    if (!body.name) {
        return next({
            message: _errConstant.EMPTY_NAME,
            status: 400
        });
    }
    if (!body.receiverIds || !Array.isArray(body.receiverIds) || body.receiverIds.length === 0) {
        return next({
            message: _errConstant.REQUIRED_RECIEVERS,
            status: 400
        });
    }
    body['userId'] = req.user.id;
    const friendParams = {
        searchParams: {
            userId: req.user.id,
            friendId: { [Op.in]: body.receiverIds }
        }
    };

    try {
        const sysFriend = await FriendRepo.friendList(friendParams);

        if (sysFriend.length !== body.receiverIds.length) {
            return next({
                message: _errConstant.ONLY_FRIENDS_IN_GROUP,
                status: 400
            });
        }
        body.type = _appConstant.CHAT_TYPE_GROUP;
        body.createdBy = req.user.id;
        const convo = await ConversationRepo.createGroupConversation(body);

        res.data = convo.toJSON();
        next();
    } catch (err) {
        next(err);
    }
}

async function conversationDelete (req, res, next) {
    try {
        const conversation = await ConversationRepo.conversationDetail({ searchParams: { id: req.params.conversationId } });

        if (conversation && conversation.type === _appConstant.CHAT_TYPE_GROUP) {
            const isGroupAdmin = await ConversationUserRepo.isConversationGroupAdmin(req.user.id, req.params.conversationId);
            if (!isGroupAdmin) {
                return next({
                    message: _errConstant.ONLY_ADMIN_DELETE_GROUP,
                    status: 400
                });
            }
            await ConversationRepo.conversationDelete({ id: req.params.conversationId });
        } else {
            await ConversationUserMessageRepo.conversationUserMessageDelete({
                conversationId: req.params.conversationId,
                userId: req.user.id
            });
            await ConversationUserRepo.conversationUserUpdate({
                conversationId: conversation.id,
                userId: req.user.id
            }, { lastMessageId: null });
        }
        next();
    } catch (err) {
        next(err);
    }
}

/*  ############################                  ##################################
                                  VERSION-2 APIS
    #############################                 ################################ */

// conversation list (optimized response)

async function V2ConversationList (req, res, next) {
    // add type filter if received from params
    const searchFilter = {};
    if (req.searchQuery.type) {
        searchFilter['type'] = req.searchQuery.type;
    }
    // search by groupname/username
    if (req.searchQuery.name && req.searchQuery.type && req.searchQuery.type === 'GROUP') {
        const groupConvoIds = await ConversationRepo.getSearchedGroupConversations(req.searchQuery.name);
        // add groupConvoIds to searchFilter
        searchFilter['id'] = groupConvoIds;
    } else if (req.searchQuery.name && req.searchQuery.type && req.searchQuery.type === 'SINGLE') {
        const singleConvoIds = await ConversationRepo.getSearchedSingleConversations(req.searchQuery.name, req.user.id);
        // add singleConvoIds to searchFilter
        searchFilter['id'] = singleConvoIds;
    } else if (req.searchQuery.name && !req.searchQuery.type) {
        const ConvoIds = await ConversationRepo.getSearchedConversations(req.searchQuery.name, req.user.id);
        // add ConvoIds to searchFilter
        searchFilter['id'] = ConvoIds;
    }

    //  params for listing conversation
    const conParams = {
        searchParams: searchFilter,
        attributes: ['id', 'name', 'createdAt', 'updatedAt'],
        include: [
            {
                model: file,
                as: 'image',
                attributes: { exclude: ['name', 'createdAt', 'updatedAt'] }
            },
            {
                model: conversationUser,
                as: 'conversationUser',
                attributes: ['id', 'lastMessageId', 'userId'],
                where: { userId: req.user.id },
                include: [
                    {
                        model: conversationMessage,
                        as: 'lastMessage',
                        attributes: ['text'],
                        include: [
                            {
                                model: conversationUserMessage,
                                attributes: ['status'],
                                where: { userId: req.user.id },
                                required: false
                            }
                        ]
                    }
                ]
            },
            {
                model: conversationUser,
                as: 'conversationReceiver',
                attributes: ['userId'],
                where: { userId: { [Op.ne]: req.user.id } },
                include: [
                    {
                        model: user,
                        attributes: ['name']
                    }
                ]
            }
        ],
        order: [
            // ['lastMessageId', 'DESC'],
            ['updatedAt', 'DESC']
        ],
        limit: 100,
        offset: 0
    };

    try {
        const conversations = await ConversationRepo.conversationList(conParams);
        let newConversations = [];

        conversations.rows.forEach(conversation => {
            conversation = conversation.toJSON();
            conversation.isMute = false;

            if (conversation.conversationUser && conversation.conversationUser.muteOn && conversation.conversationUser.muteDuration) {
                conversation.isMute = moment(conversation.conversationUser.muteOn).add(conversation.conversationUser.muteDuration, 'h').isAfter(moment());
            }
            // remove SINGLE type conversation with lastmessageId null
            if (!(conversation.type === 'SINGLE' && conversation.conversationUser.lastMessageId === null)) {
                newConversations.push(conversation);
            }
        });

        newConversations.forEach(conversation => {
            // optimize conversation image response
            if (conversation.image) {
                delete conversation.image.type;
                delete conversation.image.key;
            }

            /* last message update for each conversation */
            if (conversation.conversationUser.lastMessage && conversation.conversationUser.lastMessage.conversationUserMessages.length) {
                conversation.conversationUser.lastMessage.status = conversation.conversationUser.lastMessage.conversationUserMessages[0].status;
                delete conversation.conversationUser.lastMessage.conversationUserMessages;

                conversation.lastMessage = conversation.conversationUser.lastMessage;
                delete conversation.conversationUser;
            } else {
                conversation.lastMessage = null;
                delete conversation.conversationUser;
            }
            // take receiver's name out if single conversation
            if (conversation.name === null && conversation.conversationReceiver.user.name) {
                conversation.name = conversation.conversationReceiver.user.name;
                delete conversation.conversationReceiver;
            } else {
                delete conversation.conversationReceiver;
            }
        });

        /* apply limit & skip */
        newConversations = newConversations.slice(req.skip, req.limit + req.skip);

        res.data = {
            items: newConversations,
            paginate: { total: newConversations.length }
        };
        return next();
    } catch (err) {
        return next(err);
    }
}

// Get Conversation Members

async function getConversationMembers (req, res, next) {
    const conParams = {
        searchParams: { id: req.params.id },
        attributes: ['id'],
        include: [
            {
                model: conversationUser,
                as: 'conversationReceivers',
                attributes: ['role'],
                where: { userId: { [Op.ne]: req.user.id } },
                include: [
                    {
                        model: user,
                        attributes: ['id', 'name', 'image', 'city', 'country', 'company', 'position'],
                        include: [{
                            model: file,
                            as: 'profileImage',
                            attributes: { exclude: ['name', 'createdAt', 'updatedAt'] }
                        }]
                    }
                ]
            }]
    };

    try {
        const conversation = await ConversationRepo.conversationDetail(conParams);
        const newConversation = conversation.toJSON();
        const Admins = [];
        const Users = [];
        if (newConversation && newConversation.conversationReceivers && newConversation.conversationReceivers.length) {
            newConversation.conversationReceivers.forEach(receiver => {
                if (receiver.role === 'ADMIN') {
                    Admins.push(receiver.user);
                } else {
                    Users.push(receiver.user);
                }
            });
        }
        newConversation['Admins'] = Admins;
        newConversation['Users'] = Users;
        delete newConversation.conversationReceivers;

        res.data = { items: newConversation };
        next();
    } catch (err) {
        return next(err);
    }
}
