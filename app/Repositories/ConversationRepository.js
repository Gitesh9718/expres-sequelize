/* global _appConstant */
/**
 * Created by manoj on 30/5/19.
 */
'use strict';
const db = require('models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');
const BaseRepo = require('app/Repositories/BaseRepository');
const { user, conversationUser, conversation } = require('models');
const ConversationUserRepo = require('app/Repositories/ConversationUserRepository');
const ConversationUserMessageRepo = require('app/Repositories/ConversationUserMessageRepository');
const ConversationMessageRepo = require('app/Repositories/ConversationMessageRepository');

module.exports = {
    conversationGetOrCreate: conversationGetOrCreate,
    createGroupConversation: createGroupConversation,
    addUsersInConversation: addUsersInConversation,
    conversationBulkCreate: conversationBulkCreate,
    conversationCreate: conversationCreate,
    conversationDetail: conversationDetail,
    conversationUpdate: conversationUpdate,
    conversationList: conversationList,
    conversationCount: conversationCount,
    conversationDelete: conversationDelete,
    deleteUserConversation: deleteUserConversation,
    getSearchedGroupConversations: getSearchedGroupConversations,
    getSearchedSingleConversations: getSearchedSingleConversations,
    getSearchedConversations: getSearchedConversations
};

async function deleteUserConversation (userId) {
    const singleConversationIds = [];
    const groupConversationIds = [];
    const conParams = {
        searchParams: {},
        include: [
            {
                model: conversationUser, as: 'conversationUser', where: { userId: userId }
            }
        ]
        // group: ['id']
    };

    const conversations = await conversationList(conParams);

    conversations.forEach(conversation => {
        if (conversation.type === 'SINGLE') {
            singleConversationIds.push(conversation.id);
        } else {
            groupConversationIds.push(conversation.id);
        }
    });

    if (singleConversationIds.length) {
        await conversationDelete({ id: { [Op.in]: singleConversationIds } });
    }

    if (groupConversationIds.length) {
        // removing user from the group conversation
        await ConversationUserRepo.conversationUserDelete({ conversationId: { [Op.in]: groupConversationIds }, userId: userId });

        // Getting user message from the conversations
        const messages = await ConversationMessageRepo.conversationMessageList({ where: { conversationId: { [Op.in]: groupConversationIds }, userId: userId } });
        const messageIds = [];
        messages.forEach(message => {
            messageIds.push(message.id);
        });

        // Deleting group conversation messages
        await ConversationMessageRepo.conversationMessageDelete({ conversationId: { [Op.in]: groupConversationIds }, userId: userId });

        // Deleting user messages
        if (messageIds.length) {
            await ConversationUserMessageRepo.conversationUserMessageDelete({ conversationMessageId: { [Op.in]: messageIds } });
        }
    }

    return new Promise(resolve => resolve({}));
}

async function conversationGetOrCreate (data) {
    let convo = await db.sequelize.query('select conversationId, COUNT(userId) as user from conversationUsers join conversations on conversations.id = conversationUsers.conversationId where userId in (' + data['userId'] + ',' + data['receiverId'] + ') and conversations.deletedAt is null and conversations.type = "' + data['type'] + '" group by conversationId having user = 2', { type: Sequelize.QueryTypes.SELECT });

    if (convo.length) {
        const convoParams = {
            searchParams: { id: convo[0]['conversationId'] },
            include: [
                {
                    model: conversationUser,
                    as: 'conversationUser',
                    where: { userId: data['userId'] },
                    include: [
                        { model: user, attributes: ['id', 'name', 'image', 'publicKey', 'privateKey'] }
                    ]
                },
                {
                    model: conversationUser,
                    as: 'conversationReceiver',
                    where: { userId: { [Op.ne]: data['userId'] } },
                    include: [
                        { model: user, attributes: ['id', 'name', 'image', 'publicKey', 'privateKey'] }
                    ]
                }
            ]
        };

        return conversationDetail(convoParams);
    } else {
        convo = await conversationCreate({});

        const users = [
            {
                conversationId: convo.id,
                userId: data['userId'],
                unreadMessageCount: 0,
                createdAt: moment(),
                updatedAt: moment()
            },
            {
                conversationId: convo.id,
                userId: data['receiverId'],
                unreadMessageCount: 0,
                createdAt: moment(),
                updatedAt: moment()
            }
        ];

        await ConversationUserRepo.conversationUserBulkCreate(users);

        return new Promise(resolve => resolve(convo));
    }
}

async function createGroupConversation (data) {
    const convData = { type: _appConstant.CHAT_TYPE_SINGLE };
    if (data.hasOwnProperty('type')) {
        convData.type = data.type;
    }
    if (data.hasOwnProperty('name')) {
        convData.name = data.name;
    }
    if (data.hasOwnProperty('imageId')) {
        convData.imageId = data.imageId;
    }
    if (data.hasOwnProperty('description')) {
        convData.description = data.description;
    }
    if (data.hasOwnProperty('groupType')) {
        convData.groupType = data.groupType;
    }

    const convo = await this.conversationCreate(convData);

    await addUsersInConversation(data, convo);

    return new Promise(resolve => resolve(convo));
}

async function addUsersInConversation (data, conversation) {
    const users = [];

    if (data.hasOwnProperty('userId')) {
        users.push({
            conversationId: conversation.id,
            userId: data['userId'],
            unreadMessageCount: 0,
            role: _appConstant.CHAT_ROLE_ADMIN,
            createdAt: moment(),
            updatedAt: moment()
        });
    }

    if (data.hasOwnProperty('receiverId')) {
        users.push({
            conversationId: conversation.id,
            userId: data['receiverId'],
            unreadMessageCount: 0,
            role: _appConstant.CHAT_ROLE_USER,
            createdAt: moment(),
            updatedAt: moment()
        });
    }

    if (data.hasOwnProperty('receiverIds')) {
        data.receiverIds.forEach(receiverId => {
            users.push({
                conversationId: conversation.id,
                userId: receiverId,
                unreadMessageCount: 0,
                createdAt: moment(),
                updatedAt: moment()
            });
        });
    }

    if (!users.length) {
        return;
    }

    return await ConversationUserRepo.conversationUserBulkCreate(users);
}

async function conversationBulkCreate (data) {
    return BaseRepo.baseBulkCreate(conversation, data);
}

async function conversationCreate (data) {
    return BaseRepo.baseCreate(conversation, data);
}

async function conversationDetail (params) {
    return BaseRepo.baseDetail(conversation, params);
}

async function conversationUpdate (searchParams, data) {
    return BaseRepo.baseUpdate(conversation, searchParams, data);
}

async function conversationList (params) {
    return BaseRepo.baseList(conversation, params);
}

async function conversationCount (searchParams) {
    return BaseRepo.baseCount(conversation, searchParams);
}

async function conversationDelete (searchParams) {
    return BaseRepo.baseDelete(conversation, searchParams);
}

async function getSearchedGroupConversations (name) {
    const groupConvoIds = [];
    const groupConvo = await db.sequelize.query(`select conversations.id from conversations where (conversations.type = "GROUP" and conversations.groupType is null) and name like "%${name}%" and conversations.deletedAt is null`, { type: Sequelize.QueryTypes.SELECT });
    groupConvo.forEach(c => {
        groupConvoIds.push(c.id);
    });
    return groupConvoIds;
}

async function getSearchedSingleConversations (name, userId) {
    const singleConvoIds = [];
    const singleConvo = await db.sequelize.query(`select distinct(conversations.id) from conversations inner join conversationUsers on 
        conversationUsers.conversationId = conversations.id and conversationUsers.userId != ${userId} and conversationUsers.deletedAt is null
        inner join users on conversationUsers.userId= users.id 
        and users.name like "%${name}%" and users.deletedAt is null where (conversations.type = "SINGLE" OR conversations.groupType = "introduce") and 
        conversations.deletedAt is null`, { type: Sequelize.QueryTypes.SELECT });
    singleConvo.forEach(c => {
        singleConvoIds.push(c.id);
    });
    return singleConvoIds;
}

async function getSearchedConversations (name, userId) {
    const ConvoIds = [];
    const Convos = await db.sequelize.query(`select distinct(conversations.id) from conversations left join conversationUsers on 
       conversationUsers.conversationId = conversations.id and conversationUsers.userId != ${userId} and conversationUsers.deletedAt is null
       left join users on conversationUsers.userId= users.id 
       and users.deletedAt is null and conversations.type = "SINGLE" 
       where (users.name like "%${name}%" or conversations.name like "%${name}%") and  conversations.deletedAt is null`, { type: Sequelize.QueryTypes.SELECT });
    Convos.forEach(c => {
        ConvoIds.push(c.id);
    });
    return ConvoIds;
}
