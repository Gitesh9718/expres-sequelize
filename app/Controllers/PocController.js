/**
 * Created by manoj on 29/6/19.
 */
'use strict';
const NotificationService = require('app/Services/NotificationService');
const EncryptionService = require('app/Services/EncryptionService');
const ImageService = require('app/Services/ImageService');
const ConversationMessageRepo = require('app/Repositories/ConversationMessageRepository');
const ConversationRepo = require('app/Repositories/ConversationRepository');
const ConversationUserRepo = require('app/Repositories/ConversationUserRepository');
const AwardRepo = require('app/Repositories/AwardRepository');
const AwardMappingRepo = require('app/Repositories/AwardMappingRepository');
const CommentRepo = require('app/Repositories/CommentRepository');
const PostRepo = require('app/Repositories/PostRepository');
const UserRepository = require('app/Repositories/UserRepository');
const FavouriteRepo = require('app/Repositories/FavouriteRepository');

const ConnectionService = require('app/Services/ConnectionService');
const UtilityService = require('app/Services/UtilityService');
const fs = require('fs');
const AnalyticsService = require('app/Services/AnalyticsService');
const NotificationHelper = require('app/Services/NotificationHelper');

const db = require('models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    poc: poc,
    addUserMetaData: addUserMetaData,
    mapLastMessageId: mapLastMessageId,
    mapPostsTotalComments: mapPostsTotalComments,
    mapPostsBookmarkedCount: mapPostsBookmarkedCount,
    removeAwardMappingDeletedAwards: removeAwardMappingDeletedAwards,
    commentAwardsRecount: commentAwardsRecount,
    postAwardsRecount: postAwardsRecount,
    userAwardsRecount: userAwardsRecount,
    sendUpdateNotification: sendUpdateNotification,
    addConversationCreator: addConversationCreator,
    addConvoTypeInPost: addConvoTypeInPost,
    recountUserTotalAwards: recountUserTotalAwards
    // sendDailyNotf: sendDailyNotf
};

async function poc (req, res, next) {
    // await AnalyticsService.calculateAnalytics();
    const users = await UserRepository.userList({});
    for (const user of users) {
        await ConnectionService.migrateConnection(user.id);
    }
    // ConnectionService.createConnections(83, 84);
    // await ConnectionService.migrateConnection(81);
    // ENCRYPTION
    /* let messages = await ConversationMessageRepo.conversationMessageList({});
    for (const message of messages) {
        if (message.text) {
            console.log('updating', message.id);
            await ConversationMessageRepo.conversationMessageUpdate({id: message.id}, {text: EncryptionService.decryptText(message.text)});
        }
    } */
    // console.log('==>', UtilityService.getViewHtml('invitation.html', {}));
    // await ConnectionService.migrateConnection();
    // await NotificationHelper.sendNotificationById(582);
    /* let templateData = {
        user: {name: 'Manoj Singh Rawat', position: 'Developer', company: 'Luezoid', city: 'Delhi', otp: 123456},
        friend: {name: 'Hello'},
        message: 'Hey join  my private network',
        referralCode: 'ASX89X',
        expireDate: 'Jan 20 2025',
    };
    await NotificationService.sendMail({email: 'anupsingh001993@gmail.com'}, 'Invitation', UtilityService.getViewHtml('invitation.html', templateData)); */
    /* NotificationService.sendMessage();
    return next({ message: _errConstant.INVITE_SENT_VIA_EMAIL, status: 404 }); */

    return next();
}

async function sendUpdateNotification (req, res, next) {
    const users = await UserRepository.userList({});

    for (const user of users) {
        await NotificationHelper.sendNotification(user.id, {
            title: 'App Update',
            text: 'New update is available. Please go to app store to update.',
            type: _appConstant.NOTIFICATION_TYPE_APP_UPDATE
        });
    }

    next();
}

async function addUserMetaData (req, res, next) {
    await db.sequelize.query('UPDATE users INNER JOIN userMeta ON users.userMetaId = userMeta.id SET users.email = userMeta.email, users.password = userMeta.password');
    return next();
}

async function mapLastMessageId (req, res, next) {
    try {
        const convoUsers = await ConversationUserRepo.conversationUserList({});

        convoUsers.forEach(user => {
            db.sequelize.query(`UPDATE conversationUsers SET lastMessageId = (SELECT MAX(conversationMessageId) FROM conversationUserMessages WHERE userId = ${user.userId} AND conversationId= ${user.conversationId} AND deletedAt IS null) WHERE id = ${user.id}`);
        });

        return next();
    } catch (err) {
        return next(err);
    }
}

async function mapPostsTotalComments (req, res, next) {
    try {
        const posts = await CommentRepo.commentList({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('postId')), 'id']]
        });

        posts.forEach(post => {
            db.sequelize.query(`UPDATE posts SET totalComments = (SELECT COUNT(1) FROM comments WHERE postId = ${post.id} AND deletedAt IS NULL) WHERE id = ${post.id}`);
        });

        return next();
    } catch (err) {
        return next(err);
    }
}

async function mapPostsBookmarkedCount (req, res, next) {
    try {
        const posts = await FavouriteRepo.favouriteList({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('postId')), 'id']]
        });

        posts.forEach(post => {
            db.sequelize.query(`UPDATE posts SET bookmarkedCount = (SELECT COUNT(1) FROM favourites WHERE postId = ${post.id} AND deletedAt IS NULL) WHERE id = ${post.id}`);
        });

        return next();
    } catch (err) {
        return next(err);
    }
}

/* Delete records from awardMappings where awards are deleted */

async function removeAwardMappingDeletedAwards (req, res, next) {
    const deletedAwardIds = [];
    try {
        const awardList = await AwardRepo.awardList({ searchParams: { deletedAt: { [Op.ne]: null } }, paranoid: false });
        awardList.forEach(award => {
            deletedAwardIds.push(award.id);
        });
        await AwardMappingRepo.awardMappingDelete({ awardId: { [Op.in]: deletedAwardIds } });
        return next();
    } catch (err) {
        return next(err);
    }
}

async function commentAwardsRecount (req, res, next) {
    try {
        const comments = await db.sequelize.query('SELECT comments.id, count(awardMappings.id) as awardCount FROM comments left join awardMappings on comments.id = awardMappings.typeId and awardMappings.type = "comment" and awardMappings.deletedAt is null where comments.deletedAt is null and comments.totalAwards > 0 group by comments.id', { type: Sequelize.QueryTypes.SELECT });
        comments.forEach(cmnt => {
            db.sequelize.query(`UPDATE comments SET totalAwards = ${cmnt.awardCount} WHERE id = ${cmnt.id}`);
        });
        return next();
    } catch (err) {
        return next(err);
    }
}

async function postAwardsRecount (req, res, next) {
    const masterObj = {};
    try {
        const postAwards = await db.sequelize.query('SELECT posts.id, count(awardMappings.id) as awardCount FROM posts left join awardMappings on posts.id = awardMappings.typeId and awardMappings.type = "post" and awardMappings.deletedAt is null where posts.deletedAt is null and posts.totalAwards > 0 group by posts.id', { type: Sequelize.QueryTypes.SELECT });
        postAwards.forEach(post => {
            masterObj[post.id] = post.awardCount;
        });

        const postCommentAwards = await db.sequelize.query('SELECT posts.id, sum(comments.totalAwards) as awardCount from posts inner join comments on posts.id = comments.postId and comments.totalAwards > 0 and comments.deletedAt is null where posts.deletedAt is null group by posts.id', { type: Sequelize.QueryTypes.SELECT });
        postCommentAwards.forEach(post => {
            if (masterObj.hasOwnProperty(post.id)) {
                masterObj[post.id] += parseInt(post.awardCount);
            } else {
                masterObj[post.id] = parseInt(post.awardCount);
            }
        });

        for (const id in masterObj) {
            db.sequelize.query(`UPDATE posts set totalAwards = ${masterObj[id]} where id = ${id}`);
        }

        return next();
    } catch (err) {
        return next(err);
    }
}

async function userAwardsRecount (req, res, next) {
    const masterObj = {};
    try {
        const userAwards = await db.sequelize.query('SELECT users.id, count(awardMappings.id) as awardCount FROM users left join awardMappings on users.id = awardMappings.typeId and awardMappings.type = "user" and awardMappings.deletedAt is null where users.deletedAt is null and users.totalAwards > 0 group by users.id', { type: Sequelize.QueryTypes.SELECT });
        userAwards.forEach(user => {
            masterObj[user.id] = user.awardCount;
        });

        const userPostAwards = await db.sequelize.query('SELECT users.id, sum(posts.totalAwards) as awardCount from users inner join posts on users.id = posts.userId and posts.totalAwards > 0 and posts.deletedAt is null where users.deletedAt is null group by users.id', { type: Sequelize.QueryTypes.SELECT });
        userPostAwards.forEach(user => {
            if (masterObj.hasOwnProperty(user.id)) {
                masterObj[user.id] += parseInt(user.awardCount);
            } else {
                masterObj[user.id] = parseInt(user.awardCount);
            }
        });

        for (const id in masterObj) {
            db.sequelize.query(`UPDATE users set totalAwards = ${masterObj[id]} where id = ${id}`);
        }

        return next();
    } catch (err) {
        return next(err);
    }
}

async function addConversationCreator (req, res, next) {
    try {
        const conversations = await ConversationRepo.conversationList({ searchParams: { createdBy: null } });
        for (const convo of conversations) {
            const convoUser = await ConversationUserRepo.conversationUserList(
                {
                    searchParams: { conversationId: convo.id },
                    order: ['role'],
                    limit: 1,
                    isRaw: true
                });
            if (convoUser && convoUser.rows.length) {
                const convoCreator = convoUser.rows[0].userId;
                // console.log('id ', convo.id , convo.type , convoCreator);
                await ConversationRepo.conversationUpdate({ id: convo.id }, { createdBy: convoCreator });
            }
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

async function addConvoTypeInPost (req, res, next) {
    try {
        const posts = await PostRepo.postList({ searchParams: { isApplicableForChat: 1 } });
        console.log('posts : ', posts);
        posts.forEach(p => {
            db.sequelize.query(`update posts set forwardToConvoType = (
            select conversations.type
            from conversationMessages inner join conversations
            on conversationMessages.conversationId = conversations.id and conversations.deletedAt is null
            and conversationMessages.postId = ${p.id} and conversationMessages.deletedAt is null
            and conversationMessages.createdAt = (
            select max(t2.createdAt) from conversationMessages t2
            where t2.postId = ${p.id} and deletedAt is null
            )
            ) where id =${p.id}`);
        });

        return next();
    } catch (err) {
        return next(err);
    }
}

async function recountUserTotalAwards (req, res, next) {
    try {
        const users = await UserRepository.userList({});
        for (const user of users) {
            db.sequelize.query(`update users set totalAwards = (select sum(count) from awardMappings where userId= ${user.id} and deletedAt is null) where id= ${user.id}`);
        }

        return next();
    } catch (err) {
        return next(err);
    }
}

/* async function sendDailyNotf (req, res, next) {
    try {
        await NotificationHelper.sendDailyNotifications();
        return next();
    } catch (err) {
        return next(err);
    }
} */
