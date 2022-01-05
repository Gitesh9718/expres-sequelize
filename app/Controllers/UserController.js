/**
 * Created by manoj on 29/6/19.
 */

/* global _appConstant, _errConstant */
'use strict';

// const moment = require('moment');

const UserRepo = require('app/Repositories/UserRepository');
const UserEmailRepo = require('app/Repositories/UserEmailRepository');
const ConversationRepo = require('app/Repositories/ConversationRepository');
// const UserLikeRepo = require('app/Repositories/UserLikeRepository');
const NotificationRepo = require('app/Repositories/NotificationRepository');

const UserMetaRepo = require('app/Repositories/UserMetaRepository');
const FriendRepo = require('app/Repositories/FriendRepository');
const ReferralRepo = require('app/Repositories/ReferralRepository');
const ChatRequestRepo = require('app/Repositories/ChatRequestRepository');
const InvitationRepo = require('app/Repositories/InvitationRepository');
const CoinTransactionRepo = require('app/Repositories/CoinTransactionRepository');
const AwardMappingRepo = require('app/Repositories/AwardMappingRepository');
const BlockRepo = require('app/Repositories/BlockRepository');

const UserService = require('app/Services/UserService');
const FriendService = require('app/Services/FriendService');
const CommentRepo = require('app/Repositories/CommentRepository');
const NotificationService = require('app/Services/NotificationService');
const UserDashboardService = require('app/Services/UserDashboardService');

const jwt = require('jsonwebtoken');

const { to } = require('services/util.service');
const _ = require('lodash');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { user, friend, userMeta, file } = require('models');

const atob = require('atob');
const request = require('request').defaults({ encoding: null });

module.exports = {
    self: self,
    register: register,
    getImage: getImage,
    userCreate: userCreate,
    get: get,
    users: users,
    userProfileLogin: userProfileLogin,
    update: update,
    verifyReferral: verifyReferral,
    changeAccountStatus: changeAccountStatus,
    deleteAccount: deleteAccount,
    getMyEmails: getMyEmails,
    addOtherEmail: addOtherEmail,
    confirmEmail: confirmEmail,
    removeEmail: removeEmail,
    userStoreLike: userStoreLike,
    getUserLikesList: getUserLikesList,
    getUserAllLikesList: getUserAllLikesList
};

async function self (req, res, next) {
    res.data = { data: req.user.toJSON() };

    next();
}

async function verifyReferral (req, res, next) {
    const body = req.body;
    // let verifiedReferral;

    /* if (!body.email) {
        return next({ message: _errConstant.REQUIRED_EMAIL, status: 400 });
    } */
    if (!body.referralCode) {
        return next({ message: _errConstant.REQUIRED_REFERRAL_CODE, status: 400 });
    }

    try {
        const referral = await ReferralRepo.referralDetail({
            searchParams: {
                code: body.referralCode,
                usedAt: null
            }
        });

        if (!referral) {
            return next({ message: _errConstant.NO_REFERRAL, status: 400 });
        }

        /* //find one referral that have code matched with user's referral code
         verifiedReferral = referral.find(item => { return item.code.toLowerCase() === body.referralCode.toLowerCase() });

         //if no referral with the referralCode provided by user
         if (!verifiedReferral) {
             return next({ message: _errConstant.INVALID_REFERRAL_CODE, status: 422 });
         } */

        next();
    } catch (err) {
        next(err);
    }
}

async function register (req, res, next) {
    const body = req.body;
    // let verifiedReferral;
    const coinTransactionData = [];

    const currentDate = new Date();
    console.log('##### today\'s date --> ', currentDate);

    if (!body.email) {
        return next({ message: _errConstant.REQUIRED_EMAIL, status: 400 });
    }
    if (!body.password) {
        return next({ message: _errConstant.REQUIRED_PASSWORD, status: 400 });
    }
    if (!body.referralCode) {
        return next({ message: _errConstant.REQUIRED_REFERRAL_CODE, status: 400 });
    }
    const userParams = {
        searchParams: { email: body.email }
    };

    let userMeta, user;

    try {
        // check if user already exist
        const User = await UserRepo.userDetail(userParams);
        if (User) {
            return next({ message: _errConstant.USER_ALREADY_EXIST, status: 422 });
        }

        const referral = await ReferralRepo.referralDetail({
            searchParams: {
                code: body.referralCode,
                usedAt: null,
                rejectedAt: null
            }
        });

        if (!referral) {
            return next({ message: _errConstant.NO_REFERRAL, status: 400 });
        }

        if (currentDate > new Date(referral.expiredAt)) {
            return next({ message: _errConstant.REFERRAL_EXPIRED, status: 422 });
        }

        userMeta = await UserMetaRepo.userMetaDetail(userParams);

        if (userMeta) {
            return next({ message: _errConstant.USER_ALREADY_EXIST, status: 422 });
        }

        userMeta = await UserMetaRepo.userMetaCreate(body);

        body.userMetaId = userMeta.id;
        // body['imageId'] = _appConstant.DEFAULT_USER_IMAGE_ID;

        // give registeration welcome coins to user
        body['coins'] = _appConstant.REGISTERATION_COINS;

        user = await UserRepo.userCreate(body);

        coinTransactionData.push({
            userId: user.id,
            type: _appConstant.COINS_TRANSACTION_TYPE_REGISTERATION,
            coins: _appConstant.REGISTERATION_COINS
        });

        // await XMPPController.XMPPRegister(user, userMeta);

        // await NewUserInvitationController.createInvitations(user.id, user.email);

        await ReferralRepo.referralUpdate({ id: referral.id }, { usedAt: new Date() });
        /* let invitationSearchParams = { email: body.email };

        if (verifiedReferral.invitationId) {
            invitationSearchParams = { id: verifiedReferral.invitationId };
        }
        let invitation = await InvitationRepo.invitationDetail({
            searchParams: invitationSearchParams
        }); */

        // get inviter details
        const inviter = await UserRepo.userDetail({ searchParams: { id: referral.userId } });

        FriendService.addFriend(user, userMeta, inviter.id, inviter.userMetaId)
            .then()
            .catch(err => {
                console.error('error in signup', err);
            });

        // update user repo coz invitation accept for referral user
        await UserRepo.userCoinsUpdate(inviter.id, _appConstant.INVITATION_ACCEPTED_COINS);

        coinTransactionData.push(
            {
                userId: inviter.id,
                type: _appConstant.COINS_TRANSACTION_TYPE_INVITATION_ACCEPT,
                coins: _appConstant.INVITATION_ACCEPTED_COINS
            }
        );

        /* await InvitationRepo.invitationUpdate({ id: verifiedReferral.invitationId }, {
            friendMetaId: userMeta.id,
            friendId: user.id,
            acceptedAt: moment()
        }); */

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

        res.data = {
            user: {
                ...user.toWeb(),
                email: userMeta.email
            },
            token: user.getJWT(),
            userMeta: userMeta.toJSON()
        };

        next();
    } catch (err) {
        next(err);
    }
}

async function getImage (req, res, next) {
    try {
        const body = await UserRepo.userDetail({ searchParams: { id: req.params.id } });

        if (!body || !body.getDataValue('image')) {
            return next({ message: _errConstant.NO_IMAGE, status: 404 });
        }

        let image = body.getDataValue('image');
        if (image.indexOf(',') !== -1) {
            image = image.split(',')[1];
        }

        // convert base64 to raw binary data held in a string
        const byteString = atob(image);

        // separate out the mime component
        // let mimeString = image.split(',')[0].split(':')[1].split(';')[0];

        res.writeHead(200, {
            // 'Content-Type': mimeString,
            'Content-disposition': 'attachment;',
            'Content-Length': byteString.length
        });

        return res.end(Buffer.from(byteString, 'binary'));
    } catch (err) {
        next(err);
    }
}

async function userCreate (req, res, next) {
    const body = req.body;
    const userMeta = req.userMeta;
    let user;

    body.userMetaId = req.user.userMetaId;

    try {
        user = await UserRepo.userCreate(body);

        // await XMPPController.XMPPRegister(user, userMeta);

        const oldUser = user.toWeb();
        oldUser['email'] = userMeta.email;

        res.data = res.data = { token: user.getJWT(), user: oldUser, userMeta: userMeta.toJSON() };

        return next();
    } catch (err) {
        next(err);
    }
}

async function get (req, res, next) {
    let userId = req.user.id;
    const authUser = req.user['dataValues'];
    const connection = req.connection;
    let mutualFriendParams = null;
    let isOtherUserProfile = false;

    if (req.params.userId && parseInt(userId) !== parseInt(req.params.userId)) {
        if (!connection || (connection && connection.degree === 3 && !connection.isFavorite)) {
            return next({ message: _errConstant.NO_AUTH_TO_ACCESS_PROFILE, status: 400 });
        }

        isOtherUserProfile = true;

        userId = req.params.userId;

        mutualFriendParams = {
            searchParams: { userId: [authUser.id, userId] },
            attributes: ['friendId', [Sequelize.fn('COUNT', Sequelize.col('userId')), 'count']],
            group: ['friendId'],
            having: { count: 2 }
        };
    }

    let u, sysFriend;
    const userParams = {
        searchParams: { id: userId },
        attributes: { exclude: ['password'] },
        include: [
            {
                model: friend,
                where: { userId: { [Op.eq]: userId }, isFavorite: true },
                include: [
                    {
                        model: user,
                        attributes: _appConstant.USER_BASIC_INFO_FIELDS,
                        include: [{ model: file, as: 'profileImage' }]
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: _appConstant.MAX_FEATURE_FRIENDS
            },
            {
                model: userMeta, as: 'userMeta'
            },
            {
                model: file, as: 'profileImage'
            }
        ]
    };
    /* if (connection && connection.degree === 2) {
        userParams.include[0].where['isFavorite'] = true;
    }
*/
    const friendParams = {
        searchParams: { userId: authUser.id, friendId: userId }
    };

    try {
        let isUserBlocked = false;
        if (isOtherUserProfile) {
            const blockerDetail = await BlockRepo.blockDetail({
                searchParams: {
                    [Op.or]: [
                        { userId: req.user.id, blockedUserId: req.params.userId },
                        { userId: req.params.userId, blockedUserId: req.user.id }
                    ]
                }
            });

            if (blockerDetail) {
                if (parseInt(blockerDetail.userId) === parseInt(req.user.id) && parseInt(blockerDetail.blockedUserId) === parseInt(req.params.userId)) {
                    isUserBlocked = true;
                } else if (parseInt(blockerDetail.userId) === parseInt(req.params.userId) && parseInt(blockerDetail.blockedUserId) === parseInt(req.user.id)) {
                    return next({
                        message: _errConstant.UNAUTH_PROFILE_BLOCKED_BY_USER,
                        status: 400
                    });
                }
            }
        }
        u = await UserRepo.userDetail(userParams);
        u = u.toJSON();
        u['Friends'] = u.friends;
        u['mutualConnectionCount'] = 0;
        u['isBlocked'] = isUserBlocked;

        sysFriend = await FriendRepo.friendDetail(friendParams);
        let chatStatus = (sysFriend) ? 'APPROVED' : null;
        if (!sysFriend) {
            const request = await ChatRequestRepo.chatRequestDetail({
                searchParams: {
                    requestedUserId: userId,
                    userId: authUser.id
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            if (request && request.status !== 'REJECTED') {
                chatStatus = request.status;
            }
        }

        if (mutualFriendParams) {
            const mutualFriends = await FriendRepo.friendList(mutualFriendParams);
            u['mutualConnectionCount'] = mutualFriends.length;
        }

        if (connection && connection.degree === 3 && parseInt(userId) !== parseInt(req.params.userId)) {
            u.friends = [];
            u.Friends = [];
        }

        res.data = {
            ...u,
            isFriend: !!sysFriend,
            isFeatured: sysFriend ? !!sysFriend['isFavorite'] : false,
            chatStatus,
            degree: connection ? (connection.degree || 4) : 4
        };

        return next();
    } catch (err) {
        next(err);
    }
}

/* ========================================== OLD ==========================================  */

async function users (req, res, next) {
    const userParams = {
        searchParams: { userMetaId: req.user.userMetaId },
        limit: req.limit,
        skip: req.skip
    };

    let users, err;

    [err, users] = await to(UserRepo.userList(userParams));
    if (err) {
        return next(err);
    }

    res.data = { items: users.rows, paginate: { total: users.count } };

    return next();
}

async function userProfileLogin (req, res, next) {
    const requestedUser = req.user;
    const userMeta = req.userMeta;
    let user; let err;

    const userParams = {
        searchParams: { id: req.params.id }
    };

    [err, user] = await to(UserRepo.userDetail(userParams));

    if (err) {
        return next({ message: err, status: 422 });
    }
    if (!user) {
        return next({ message: _errConstant.NO_USER, status: 422 });
    }
    if (user.userMetaId !== requestedUser.userMetaId) {
        return next({ message: _errConstant.NO_AUTH, status: 422 });
    }

    const oldUser = user.toWeb();
    oldUser['email'] = userMeta.email;

    res.data = { token: user.getJWT(), user: oldUser, userMeta: userMeta.toJSON() };
    next();
}

async function update (req, res, next) {
    const user = req.user;
    const userMeta = req.userMeta;
    const data = req.body;

    let shouldCreditCoins = false;

    if (!data.password) {
        delete data.password;
    }

    try {
        if (data.hasOwnProperty('password')) {
            await UserMetaRepo.userMetaPasswordUpdate({ id: userMeta.id }, { password: data.password });
            await UserRepo.userPasswordUpdate({ id: user.id }, { password: data.password });
            delete data.password;
        }

        if (data.image) {
            UserService.userImageCompressAndUpdate(user.id, data.image)
                .then()
                .catch(err => {
                    console.error('error while compressing image', err, 'name =>', path + key);
                });
        }

        if (data.hasOwnProperty('otherEmails')) {
            await UserService.updateUserOtherEmails(user.id, data.otherEmails);

            /* if(_.isEmpty(data.otherEmails)){
                await UserEmailRepo.userEmailDelete({userId: user.id});
            }
            else{
             //take only unique emails from user side
             data.otherEmails = _.uniq(data.otherEmails);
              try{
               await UserService.updateUserOtherEmails(user.id, data.otherEmails);
              }
               catch(err){
                   return next(err);
               }
            } */
        }

        if (data.imageId) {
            const User = await UserRepo.userDetail({ searchParams: { id: user.id } });
            if (User && User.imageId === null) {
                shouldCreditCoins = true;
            }
        }

        await UserRepo.userUpdate({ id: user.id }, data);

        if (shouldCreditCoins) {
            // update user coins for pic upload for first time
            await UserRepo.userCoinsUpdate(user.id, _appConstant.UPLOAD_PROFILE_PIC_COINS);
            // coin transaction
            await CoinTransactionRepo.coinTransactionCreate({
                userId: user.id,
                type: _appConstant.COINS_TRANSACTION_TYPE_PROFILE_PIC_UPLOAD,
                coins: _appConstant.UPLOAD_PROFILE_PIC_COINS
            });
        }

        const updatedUser = await UserRepo.userDetail({
            searchParams: { id: user.id },
            include: [{ model: file, as: 'profileImage' }]
        });

        res.data = {
            user: {
                ...updatedUser.toJSON(),
                email: userMeta.email
            }
        };

        return next();
    } catch (err) {
        return next(err);
    }
}

async function changeAccountStatus (req, res, next) {
    const status = req.body.status || _appConstant.USER_STATUS_ACTIVE;
    const user = req.user;
    const userMeta = req.userMeta;

    if (req.body.password && !userMeta.comparePassword(req.body.password)) {
        return next({ message: _errConstant.INVALID_CREDENTIALS, status: 400 });
    }

    try {
        await UserRepo.userUpdate({ id: user.id }, { status });

        return next();
    } catch (err) {
        return next(err);
    }
}

async function deleteAccount (req, res, next) {
    const user = req.user;
    const userMeta = req.userMeta;

    try {
        await CommentRepo.commentDelete({ userId: user.id });

        await ConversationRepo.deleteUserConversation(user.id);

        await InvitationRepo.invitationDelete({
            [Op.or]: [
                { userId: user.id },
                { friendId: user.id }
            ]
        });
        await FriendRepo.friendDelete({
            [Op.or]: [
                { userId: user.id },
                { friendId: user.id }
            ]
        });
        await UserMetaRepo.userMetaDelete({ id: userMeta.id });
        await UserRepo.userDelete({ id: user.id });

        return next();
    } catch (err) {
        return next(err);
    }
}

async function getMyEmails (req, res, next) {
    const emailParams = {
        searchParams: { userId: req.user.id },
        limit: req.limit,
        offset: req.skip
    };
    try {
        const emails = await UserEmailRepo.userEmailList(emailParams);

        res.data = { items: emails.rows, paginate: { total: emails.count } };

        return next();
    } catch (err) {
        return next(err);
    }
}

/* add an extra email */

async function addOtherEmail (req, res, next) {
    const body = req.body;
    let emailDetail;

    if (!body.email) {
        return next({ message: _errConstant.REQUIRED_EMAIL, status: 400 });
    }

    const userEmailData = { userId: req.user.id, email: body.email };

    try {
        // check for email existance in user Table
        emailDetail = await UserRepo.userDetail({ searchParams: { email: body.email } });
        if (emailDetail) {
            return next({ message: _errConstant.EMAIL_ALREADY_EXIST, status: 400 });
        }

        // check for email existance in userEmail Table
        emailDetail = await UserEmailRepo.userEmailDetail({ searchParams: { email: body.email } });
        if (emailDetail) {
            return next({ message: _errConstant.EMAIL_ALREADY_EXIST, status: 400 });
        }

        // create an email token
        jwt.sign(userEmailData, _config.EMAIL_SECRET, (err, emailToken) => {
            if (err) throw err;
            // create an url for email
            const url = _config.APP_URL + `/v1/confirm-emails/${emailToken}`;
            // email message
            const message = `Please click this link to confirm your email : <a href="${url}">${url}</a>`;
            // send email
            NotificationService.sendMail({ email: body.email }, 'Email Confirmation', message);
        });
        return next();
    } catch (err) {
        return next(err);
    }
}

/* confirm your email */

async function confirmEmail (req, res, next) {
    const emailToken = req.params.token;
    let userId, newEmail;

    try {
        // verify the jwt token
        jwt.verify(emailToken, _config.EMAIL_SECRET, (err, userEmailData) => {
            if (err) throw err;
            // get payload data
            userId = userEmailData.userId;
            newEmail = userEmailData.email;
        });

        // check if email is already exist(confirmed)
        const emailDetail = await UserEmailRepo.userEmailDetail({ searchParams: { email: newEmail } });

        if (emailDetail) {
            return next({ message: _errConstant.EMAIL_ALREADY_ADDED });
        }

        // add new confirmed email to userEmails table
        await UserEmailRepo.userEmailCreate({ userId: userId, email: newEmail });

        return next();
    } catch (err) {
        return next(err);
    }
}

/* remove an email */
async function removeEmail (req, res, next) {
    const emailId = req.params.emailId;

    try {
        await UserEmailRepo.userEmailDelete({ id: emailId });
        // res.data = {email: userEmail};
        return next();
    } catch (err) {
        return next(err);
    }
}

async function userStoreLike (req, res, next) {
    const body = {
        type: _appConstant.AWARD_TYPE_USER,
        typeId: req.params.id,
        presenterId: req.user.id
    };

    try {
        // check for blocked user
        const blockData = await BlockRepo.blockDetail({
            searchParams: {
                [Op.or]: [
                    { userId: req.user.id, blockedUserId: req.params.id },
                    { userId: req.params.id, blockedUserId: req.user.id }
                ]
            }
        });
        if (blockData) {
            if (parseInt(blockData.userId) === parseInt(req.user.id) && parseInt(blockData.blockedUserId) === parseInt(req.params.id)) {
                return next({
                    message: _errConstant.USER_BLOCKED_BY_YOU,
                    status: 400
                });
            } else if (parseInt(blockData.userId) === parseInt(req.params.id) && parseInt(blockData.blockedUserId) === parseInt(req.user.id)) {
                return next({
                    message: _errConstant.UNAUTH_PROFILE_BLOCKED_BY_USER,
                    status: 400
                });
            }
        }
        // get presenter's current coins
        const presenterCoins = req.user.coins;
        // check if coins are not sufficient
        if (presenterCoins + _appConstant.AWARD_ALLOCATE_COINS < 0) {
            return next({ message: _errConstant.NOT_ENOUGH_COINS, status: 400 });
        }

        const User = await UserRepo.userDetail({ searchParams: { id: req.params.id } });
        if (!User) {
            return next({ message: _errConstant.NO_USER, status: 400 });
        }
        const userId = User.id;
        body['userId'] = userId;
        if (userId === req.user.id) {
            return next({ message: _errConstant.SELF_AWARD_ERROR, status: 400 });
        }

        // check if already gave like award
        const likeUser = await AwardMappingRepo.awardMappingDetail({ searchParams: body });

        if (likeUser) {
            await AwardMappingRepo.awardMappingUpdate({ id: likeUser.id }, { count: Sequelize.literal('count + 1') });
        } else {
            await AwardMappingRepo.awardMappingCreate(body);
        }

        // update userAwards & totalAwards for rewarded user
        await UserRepo.userUpdate({ id: req.params.id }, {
            userAwards: Sequelize.literal('userAwards + 1'),
            totalAwards: Sequelize.literal('totalAwards + 1')
        });

        // update users, deduct coins for giving award
        await UserRepo.userCoinsUpdate(req.user.id, _appConstant.AWARD_ALLOCATE_COINS);

        // create coinTransaction log
        const coinTransactionObj = {
            userId: req.user.id,
            type: _appConstant.COINS_TRANSACTION_TYPE_AWARD_USER,
            typeId: req.params.id,
            coins: _appConstant.AWARD_ALLOCATE_COINS
        };

        await CoinTransactionRepo.coinTransactionCreate(coinTransactionObj);

        // send notification to user for receiving award
        await NotificationRepo.notificationCreate({
            type: _appConstant.NOTIFICATION_TYPE_AWARD_USER,
            actionOwnerId: req.user.id,
            userId: req.params.id,
            text: req.user.name + ' has gave you an award'
        });

        // user network awards for dashboard
        UserDashboardService.UserNetworkAwardCreateORUpdate(req.params.id);

        // user awards given for dashboard with params(presenterId, receiverId)
        UserDashboardService.UserAwardGivenCreateOrUpdate(req.user.id, req.params.id);

        return next();
    } catch (err) {
        return next(err);
    }
}

async function getUserAllLikesList (req, res, next) {
    const rewardedUserId = req.params.id;
    const userLikeParam = {
        searchParams: { userId: rewardedUserId },
        include: [{
            model: user,
            as: 'presentingUser',
            attributes: { exclude: _appConstant.USER_HIDDEN_FIELDS },
            include: [{ model: file, as: 'profileImage' }]
        }
        ],

        limit: req.limit,
        offset: req.skip
    };
    try {
        const originalUser = await UserRepo.userDetail({ searchParams: { id: rewardedUserId } });
        if (!originalUser) {
            return next({ message: _errConstant.NO_USER, status: 400 });
        }

        const userLikers = await AwardMappingRepo.awardMappingList(userLikeParam);
        if (!userLikers.rows.length) {
            res.data = { items: [], paginate: { total: 0 } };
            return next();
        }
        const newUserLikers = [];
        userLikers.rows.forEach(userLike => {
            newUserLikers.push(userLike.presentingUser);
        });
        res.data = { items: newUserLikers, paginate: { total: newUserLikers.length } };
        return next();
    } catch (err) {
        return next(err);
    }
}

async function getUserLikesList (req, res, next) {
    const userLikeParam = {
        searchParams: { type: _appConstant.AWARD_TYPE_USER, typeId: req.params.id },
        include: [
            {
                model: user,
                as: 'presentingUser',
                attributes: { exclude: _appConstant.USER_HIDDEN_FIELDS },
                include: [{ model: file, as: 'profileImage' }]
            }
        ],

        limit: req.limit,
        offset: req.skip
    };
    try {
        const originalUser = await UserRepo.userDetail({ searchParams: { id: req.params.id } });
        if (!originalUser) {
            return next({ message: _errConstant.NO_USER, status: 400 });
        }

        const userLikers = await AwardMappingRepo.awardMappingList(userLikeParam);
        if (!userLikers.rows.length) {
            res.data = { items: [], paginate: { total: 0 } };
            return next();
        }
        const newUserLikers = [];
        userLikers.rows.forEach(userLike => {
            newUserLikers.push(userLike.presentingUser);
        });

        res.data = { items: newUserLikers, paginate: { total: newUserLikers.length } };
        return next();
    } catch (err) {
        return next(err);
    }
}
