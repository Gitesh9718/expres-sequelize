const moment = require('moment');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {user, referral, userMeta, file} = require('models');

const UserRepo = require('app/Repositories/UserRepository');
const UserEmailRepo = require('app/Repositories/UserEmailRepository');
const InvitationRepo = require('app/Repositories/InvitationRepository');
const FriendRepo = require('app/Repositories/FriendRepository');
const NotificationRepo = require('app/Repositories/NotificationRepository');
const ReferralRepo = require('app/Repositories/ReferralRepository');
const CoinTransactionRepo = require('app/Repositories/CoinTransactionRepository');

// const FriendService = require('app/Services/FriendService');

const NotificationService = require('app/Services/NotificationService');
const UtilityService = require('app/Services/UtilityService');
const ConnectionService = require('app/Services/ConnectionService');

module.exports = {
    create: create,
    createReferral: createReferral,
    getAll: getAll,
    destroy: destroy,
    acceptInviteByReferralCode: acceptInviteByReferralCode,
    rejectInviteByReferralCode: rejectInviteByReferralCode,
    getInviterDetails: getInviterDetails,
    acceptInvitation: acceptInvitation,
    rejectInvitation: rejectInvitation,
    resendInvitation: resendInvitation,
    clearInvitations: clearInvitations,
    acceptInvitationWithReferral: acceptInvitationWithReferral,
    sendInviteToConversationGroupMember: sendInviteToConversationGroupMember,
};

async function create(req, res, next) {
    let body = req.body;
    let userMeta = req.userMeta;
    let responseData = {};
    if (!body.email) {
        return next({message: _errConstant.REQUIRED_EMAIL, status: 400});
    }

    //get user with their profileImage
    let userParams = {
        searchParams: {id: req.user.id},
        include: [
            {model: file, as: 'profileImage'},
        ]
    };

    let loggedInUser = await UserRepo.userDetail(userParams);

    try {
        let referralCode = UtilityService.generateReferralCode();
        let message = null;
        let templateData = {
            user: loggedInUser,
            referralCode: referralCode,
            friend: {name: body.name},
            expireDate: moment().add(_appConstant.INVITATION_EXPIRE_DAYS, 'd').format('LL'),
            message: body.private_text || body.privateText || body.publicText
        };
        let friendUser = null;
        let invitationSearchParams = {};
        let invitationInfo = {
            userMetaId: userMeta.id,
            userId: loggedInUser.id,
            publicText: body.public_text || body.publicText,
            privateText: body.private_text || body.privateText,
            sendAt: moment()
        };
        let isReferralExist = false;

        let friendCount = await FriendRepo.friendCount({userMetaId: userMeta.id});

        if (friendCount >= _appConstant.MAX_FRIENDS) {
            return next({message: _errConstant.MAX_FRIEND_LIMIT, status: 400});
        }

        friendUser = await UserRepo.userDetail({searchParams: {email: body.email}});

        if (!friendUser) {
            let emailParams = {
                searchParams: {email: body.email},
                include: [
                    {model: user}
                ]
            };

            let emailUser = await UserEmailRepo.userEmailDetail(emailParams);

            if (emailUser) {
                friendUser = emailUser.user;
            }
        }

        //check if invite send to self
        if (friendUser && friendUser.id === loggedInUser.id) {
            return next({message: _errConstant.SELF_INVITE_SEND, status: 400})
        }

        if (friendUser) {
            let friendParam = {
                searchParams: {
                    [Op.and]: [{userMetaId: userMeta.id}, {friendMetaId: friendUser.userMetaId}]
                }
            };

            let friend = await FriendRepo.friendDetail(friendParam);

            if (friend) {
                return next({message: _errConstant.ALREADY_CONTACT, status: 409}, null);
            }
            invitationSearchParams = {
                [Op.or]: [
                    {userId: loggedInUser.id, friendMetaId: friendUser.userMetaId},
                    {userId: friendUser.userMetaId, friendMetaId: loggedInUser.id}
                ],
                rejectedAt: null,
                acceptedAt: null
            };
            invitationInfo = {
                ...invitationInfo,
                friendMetaId: friendUser.userMetaId,
                friendId: friendUser.id,
            };

            templateData.friend = friendUser;
            templateData.referralCode = null;
        } else {
            invitationSearchParams = {
                userId: loggedInUser.id, email: body.email,
                rejectedAt: null, acceptedAt: null
            };

            invitationInfo = {
                ...invitationInfo,
                email: body.email,
                name: body.name,
            };
            templateData.friend = {name: body.name};
        }

        let invitation = await InvitationRepo.invitationDetail({searchParams: invitationSearchParams});

        if (invitation) {
            if (!invitation.isCleared) {
                return next({message: _errConstant.INVITATION_ALREADY_SENT, status: 400});
            }

            //else set invitation isCleared to false
            await InvitationRepo.invitationUpdate({id: invitation.id}, {isCleared: false});

            //get referral if user does not exist on system
            if (!friendUser) {
                let referralParam = {
                    invitationId: invitation.id,
                    usedAt: null
                }
                let referral = await ReferralRepo.referralDetail({searchParams: referralParam});
                if (referral) {
                    templateData.referralCode = referral.code;
                    //set isReferralExist to true
                    isReferralExist = true;
                    //update expired Date of the referral
                    await ReferralRepo.referralUpdate({id: referral.id}, {expiredAt: moment().add(_appConstant.INVITATION_EXPIRE_DAYS, 'd')});
                }
            }
        } else {
            invitation = await InvitationRepo.invitationCreate(invitationInfo);
        }

        /*
         * If user exist on our platform send the notification else
         * Create referral code and send mail
        */
        if (friendUser) {
            await NotificationRepo.notificationCreate({
                type: _appConstant.NOTIFICATION_TYPE_INVITATION, actionOwnerId: req.user.id, typeId: invitation.id,
                userId: friendUser.id, text: req.user.name + ' send you an invitation'
            });

            //set response if user exist in app
            responseData['invitation'] = invitation.toJSON()

        } else {
            if (!isReferralExist) {
                await ReferralRepo.referralCreate({
                    invitationId: invitation.id,
                    userId: loggedInUser.id,
                    email: body.email,
                    code: referralCode,
                    expiredAt: moment().add(_appConstant.INVITATION_EXPIRE_DAYS, 'd')
                });
            }

            //set referralCode as response if user not exist in app
            responseData['referralCode'] = referralCode;

            /* message = UtilityService.getViewHtml('invitation.html', templateData);
             await NotificationService.sendMail({ email: body.email }, 'Invitation', message); */
        }

        //res.data = { invitation: invitation.toJSON() };
        res.data = responseData;
        next();
    } catch (err) {
        next(err);
    }
}


async function createReferral(req, res, next) {
    try {
        let referralCode = UtilityService.generateReferralCode();
        let referral = await ReferralRepo.referralCreate({
            userId: req.user.id,
            code: referralCode,
            expiredAt: moment().add(_appConstant.INVITATION_EXPIRE_DAYS, 'd')
        })

        res.data = {code: referral.code, expiredAt: referral.expiredAt}
        return next();
    } catch (err) {
        return next
    }
}

async function getAll(req, res, next) {
    let loggedInUser = req.user,
        userMetaInfo = req.userMeta,
        searchParams = req.searchQuery || {},
        invitations;

    let invitationParams = {
        searchParams: {},
        include: [
            {model: user, as: 'user', include: [{model: file, as: 'profileImage'}]},
            {model: user, as: 'friend', include: [{model: file, as: 'profileImage'}]},
            {model: userMeta, as: 'friendMeta', attributes: {exclude: ['password']}},
        ],
        order: [
            ['createdAt', 'DESC']
        ],
        attributes: {exclude: ['privateText']},
        limit: req.limit,
        offset: req.skip
    };

    if (searchParams.type === 'SENT') {
        invitationParams.searchParams = {userId: loggedInUser.id, rejectedAt: null, acceptedAt: null, isCleared: false};
    } else {
        invitationParams.searchParams = {
            friendMetaId: userMetaInfo.id,
            rejectedAt: null,
            acceptedAt: null,
            isCleared: false
        }
    }

    try {
        invitations = await InvitationRepo.invitationList(invitationParams);
        let newInvitations = [];
        invitations.rows.forEach(invitation => {
            invitation = invitation.toJSON();

            if (!invitation.user.city) {
                invitation.user.city = '';
            }
            if (!invitation.user.position) {
                invitation.user.position = '';
            }
            if (invitation.friend) {
                if (!invitation.friend.city) {
                    invitation.friend.city = '';
                }
                if (!invitation.friend.position) {
                    invitation.friend.position = '';
                }
            }

            newInvitations.push(invitation);
        });
        res.data = {items: newInvitations, paginate: {total: invitations.count}};

        return next();
    } catch (err) {
        return next(err);
    }
}

async function destroy(req, res, next) {
    next();
}

async function acceptInviteByReferralCode(req, res, next) {
    let body = req.body;
    let user = req.user;
    let coinTransactionData = [];
   
    if (!body.referralCode) {
        return next({message: _errConstant.REQUIRED_REFERRAL_CODE, status: 400});
    }
    try {
        //check for friend count limits
        let friendCount = await FriendRepo.friendCount({userId: user.id});

        if (friendCount >= _appConstant.MAX_FRIENDS) {
            return next({message: _errConstant.MAX_FRIEND_LIMIT, status: 400});
        }

        //check for referral existance
        let referral = await getReferralDetails(req, res, next);

        //get inviter detail
        let inviter = await UserRepo.userDetail({searchParams: {id: referral.userId}});

        if (!inviter) {
            return next({message: _errConstant.NO_INVITER, status: 400})
        }

        //check if invite sent to self
        if (user.id === inviter.id) {
            return next({message: _errConstant.SELF_INVITE_ACCEPT, status: 400})
        }

        //check if already a friend
        let friendParam = {
            searchParams: {
                [Op.and]: [{userId: user.id}, {friendId: inviter.id}]
            }
        };
        let isFriend = await FriendRepo.friendDetail(friendParam);
        if (isFriend) {
            return next({message: _errConstant.ALREADY_CONTACT, status: 409}, null);
        }

        let friends = [
            {
                userMetaId: user.userMetaId, userId: user.id,
                friendMetaId: inviter.userMetaId, friendId: inviter.id
            },
            {
                userMetaId: inviter.userMetaId, userId: inviter.id,
                friendMetaId: user.userMetaId, friendId: user.id
            },
        ];

        await FriendRepo.friendBulkCreate(friends);

        //update Refferral table (with updating usedAt)
        await ReferralRepo.referralUpdate({id: referral.id}, {usedAt: moment()});

        //update invitation accept coins for inviter
        await UserRepo.userCoinsUpdate(inviter.id, _appConstant.INVITATION_ACCEPTED_COINS);

        coinTransactionData.push({
            userId: inviter.id,
            type: _appConstant.COINS_TRANSACTION_TYPE_INVITATION_ACCEPT,
            coins: _appConstant.INVITATION_ACCEPTED_COINS
        });

        //get all first degree friends of invitation sender to allocate coins
        let firstDegreeFriends = await FriendRepo.friendList({
            searchParams: {
                userId: inviter.id,
                friendId: {[Op.ne]: inviter.id}
            }
        });
        let friendIds = [];
        firstDegreeFriends.forEach(frnd => {
            friendIds.push(frnd.friendId);
            coinTransactionData.push(
                {
                    userId: frnd.friendId,
                    type: _appConstant.COINS_TRANSACTION_TYPE_FRIEND_INVITATION_ACCEPT,
                    coins: _appConstant.FRIEND_INVITATION_ACCEPTED_COINS
                }
            )
        })

        await UserRepo.userCoinsUpdate(friendIds, _appConstant.FRIEND_INVITATION_ACCEPTED_COINS);
        //create coinTransaction log
        await CoinTransactionRepo.coinTransactionBulkCreate(coinTransactionData);

        // await FriendService.addFriend(invitation.userId, invitation.userMetaId, invitation.friendId, invitation.friendMetaId);

        await NotificationRepo.notificationCreate({
            type: _appConstant.NOTIFICATION_TYPE_INVITATION_ACCEPT, actionOwnerId: req.user.id,
            userId: inviter.id, text: req.user.name + ' accepted your invitation'
        });

        console.log("### CREATING CONNECTIONS FOR userId %s with inviterId %s FROM ACCEPT-INVITATION", user.id, inviter.id);
        // mapping connections
        ConnectionService.createConnections(inviter.id, user.id);

        return next();
    } catch (err) {
        return next(err);
    }
}


async function rejectInviteByReferralCode(req, res, next) {
    let body = req.body;
    if (!body.referralCode) {
        return next({message: _errConstant.REQUIRED_REFERRAL_CODE, status: 400});
    }

    try{
        let referral = await getReferralDetails(req, res, next);

        await ReferralRepo.referralUpdate(
            {id: referral.id},
            {rejectedAt: moment()});
    
        return next();
    }
    catch(err){
        return next(err);
    }

}


async function getInviterDetails(req, res, next) {
    //let currentDate = new Date();

    try{
        let referral = await ReferralRepo.referralDetail({
            searchParams: {
                code: req.params.code,
                //usedAt: null,
                //rejectedAt: null
            }
        });

        if (!referral) {
            return next({ message: _errConstant.NO_REFERRAL, status: 400 });
        }

       /* if(currentDate >  new Date(referral.expiredAt)){
            return next({message: _errConstant.REFERRAL_EXPIRED, status: 422})
        }*/

        let user = await UserRepo.userDetail({
            searchParams: {id: referral.userId},
            include: [
                {model: file, as: 'profileImage'},
            ]
        });

        if (!user) {
        return next({message: _errConstant.NO_INVITER, status: 400})
        }

       res.data = {user};
       return next();
    }
    catch(err){
        return next(err);
    }

}


//  GET REFERRAL DETAILS
async function getReferralDetails(req, res, next) {
    let currentDate = new Date();
    let referralParam = {
        searchParams: {
            code: req.body.referralCode
        }
    }

     //check for referral existance
     let referral = await ReferralRepo.referralDetail(referralParam);

    if (!referral) {
        return next({message: _errConstant.NO_REFERRAL, status: 400});
    }

    if (referral.usedAt) {
        return next({message: _errConstant.REFERRAL_ALREADY_USED, status: 400});
    }

    if (referral.rejectedAt) {
        return next({message: _errConstant.REFERRAL_ALREADY_REJECTED, status: 400});
    }

    if(currentDate >  new Date(referral.expiredAt)){
        return next({message: _errConstant.REFERRAL_EXPIRED, status: 422})
    }

    return referral;
}


async function acceptInvitation(req, res, next) {
    let body = req.body;
    let userMeta = req.userMeta;
    let coinTransactionData = [];

    if (!body.userId) {
        return next({message: _errConstant.REQUIRED_PROFILE_ID, status: 400});
    }

    try {
        let friendCount = await FriendRepo.friendCount({userMetaId: userMeta.id});

        if (friendCount >= _appConstant.MAX_FRIENDS) {
            return next({message: _errConstant.MAX_FRIEND_LIMIT, status: 400});
        }

        let invitation = await getInvitation(req, res, next);
        //check if invite send by self
        if (req.user.id === invitation.userId) {
            return next({message: _errConstant.SELF_INVITE_ACCEPT, status: 400})
        }

        //check if already a friend
        let friendParam = {
            searchParams: {
                [Op.and]: [{userMetaId: userMeta.id}, {friendMetaId: invitation.userMetaId}]
            }
        };
        let isFriend = await FriendRepo.friendDetail(friendParam);
        if (isFriend) {
            return next({message: _errConstant.ALREADY_CONTACT, status: 409}, null);
        }

        let friends = [
            {
                userMetaId: invitation.userMetaId, userId: invitation.userId,
                friendMetaId: invitation.friendMetaId, friendId: invitation.friendId
            },
            {
                userMetaId: invitation.friendMetaId, userId: invitation.friendId,
                friendMetaId: invitation.userMetaId, friendId: invitation.userId
            },
        ];

        await FriendRepo.friendBulkCreate(friends);

        //update user repo coz invitation accept for referral user
        await UserRepo.userCoinsUpdate(invitation.userId, _appConstant.INVITATION_ACCEPTED_COINS);

        coinTransactionData.push({
            userId: invitation.userId,
            type: _appConstant.COINS_TRANSACTION_TYPE_INVITATION_ACCEPT,
            coins: _appConstant.INVITATION_ACCEPTED_COINS
        });

        //get all first degree friends of invitation sender to allocate coins
        let firstDegreeFriends = await FriendRepo.friendList({
            searchParams: {
                userId: invitation.userId,
                friendId: {[Op.ne]: invitation.userId}
            }
        });
        let friendIds = [];
        firstDegreeFriends.forEach(frnd => {
            friendIds.push(frnd.friendId);
            coinTransactionData.push(
                {
                    userId: frnd.friendId,
                    type: _appConstant.COINS_TRANSACTION_TYPE_FRIEND_INVITATION_ACCEPT,
                    coins: _appConstant.FRIEND_INVITATION_ACCEPTED_COINS
                }
            )
        })

        await UserRepo.userCoinsUpdate(friendIds, _appConstant.FRIEND_INVITATION_ACCEPTED_COINS);
        //create coinTransaction log
        await CoinTransactionRepo.coinTransactionBulkCreate(coinTransactionData);

        // await FriendService.addFriend(invitation.userId, invitation.userMetaId, invitation.friendId, invitation.friendMetaId);

        await NotificationRepo.notificationCreate({
            type: _appConstant.NOTIFICATION_TYPE_INVITATION_ACCEPT, actionOwnerId: req.user.id, typeId: invitation.id,
            userId: invitation.userId, text: req.user.name + ' accepted your invitation'
        });

        console.log("### CREATING CONNECTIONS FOR userId %s with inviterId %s FROM ACCEPT-INVITATION", invitation.friendId, invitation.userId);
        // mapping connections
        ConnectionService.createConnections(invitation.userId, invitation.friendId);

        await InvitationRepo.invitationUpdate({
            id: req.params.id, friendId: req.user.id
        }, {acceptedAt: moment()});

        next();
    } catch (err) {
        return next(err);
    }
}

async function rejectInvitation(req, res, next) {
    try {
        let invitation = await getInvitation(req, res, next);

        await InvitationRepo.invitationUpdate({
            id: req.params.id,
            friendId: req.user.id
        }, {rejectedAt: moment()});

        next();

    } catch (err) {
        return next(err);
    }
}

async function getInvitation(req, res, next) {
    let invitation = await InvitationRepo.invitationDetail({
        searchParams: {
            id: req.params.id,
            friendMetaId: req.userMeta.id
        }
    });

    if (!invitation) {
        return next({message: _errConstant.NO_INVITATION, status: 400});
    }
    if (invitation.rejectedAt) {
        return next({message: _errConstant.INVITATION_ALREADY_REJECTED, status: 400});
    }
    if (invitation.acceptedAt) {
        return next({message: _errConstant.INVITATION_ALREADY_ACCEPTED, status: 400});
    }

    return invitation;
}

async function clearInvitations(req, res, next) {
    try {
        let invitation = await InvitationRepo.invitationDetail({searchParams: {id: req.params.id}});

        if (!invitation) {
            return next({message: _errConstant.NO_INVITATION, status: 400});
        }
        /*if (!invitation.acceptedAt && !invitation.rejectedAt) {
            return next({ message: _errConstant.INVITATION_PENDING, status: 400 });
        }*/

        await InvitationRepo.invitationUpdate({userId: req.user.id, id: req.params.id}, {isCleared: true});
        next();
    } catch (err) {
        return next(err);
    }
}

async function resendInvitation(req, res, next) {
    try {
        let invitationParams = {
            searchParams: {id: req.params.id, userMetaId: req.userMeta.id},
            include: [
                {model: referral},
                {model: user, as: 'friend', attributes: _appConstant.USER_BASIC_INFO_FIELDS},
                {model: userMeta, as: 'friendMeta', attributes: {exclude: ['password']}}
            ],
        };

        let invitation = await InvitationRepo.invitationDetail(invitationParams);

        if (!invitation) {
            return next({message: _errConstant.NO_INVITATION, status: 400});
        }
        if (invitation.rejectedAt) {
            return next({message: _errConstant.INVITATION_ALREADY_REJECTED, status: 400});
        }
        if (invitation.acceptedAt) {
            return next({message: _errConstant.INVITATION_ALREADY_ACCEPTED, status: 400});
        }

        let templateData = {
            user: req.user,
            referralCode: null,
            friend: {name: invitation.name},
            expireDate: moment().add(_appConstant.INVITATION_EXPIRE_DAYS, 'd').format('LL'),
            message: invitation.publicText || invitation.privateText
        };

        let email = invitation.email;
        if (invitation.friendMeta && invitation.friend) {
            email = invitation.friendMeta.email;
            templateData.friend.name = invitation.friend.name;
        }
        if (invitation.referral) {
            templateData.referralCode = invitation.referral.code;
            if (invitation.referral.expiredAt) {
                templateData.expireDate = moment(invitation.referral.expiredAt).add(_appConstant.INVITATION_EXPIRE_DAYS, 'd').format('LL');
            }
        }

        await InvitationRepo.invitationUpdate({id: invitation.id}, {sendAt: moment()});

        // sending mail
        let message = UtilityService.getViewHtml('invitation.html', templateData);
        await NotificationService.sendMail({email}, 'Invitation', message);

        next();
    } catch (err) {
        return next(err);
    }
}


//accept invitation with referral
async function acceptInvitationWithReferral(req, res, next) {
    let body = req.body;
    let userMeta = req.userMeta;
    let coinTransactionData = [];

    //body must have a referral code
    if (!body.referralCode) {
        return next({message: _errConstant.REQUIRED_REFERRAL_CODE, status: 400});
    }
    //body must have email where user got invitation
    if (!body.email) {
        return next({message: _errConstant.REQUIRED_EMAIL, status: 400});
    }

    //check if we are exceeding total friends limit

    try {
        let friendCount = await FriendRepo.friendCount({userMetaId: userMeta.id});

        if (friendCount >= _appConstant.MAX_FRIENDS) {
            return next({message: _errConstant.MAX_FRIEND_LIMIT, status: 400});
        }

        //check if no referral data exist
        let referral = await ReferralRepo.referralList({
            searchParams: {
                email: body.email,
                usedAt: null
            }
        });

        if (!referral.length) {
            return next({message: _errConstant.NO_REFERRAL, status: 400});
        }

        //find one referral that have code matched with user's referral code
        let verifiedReferral = referral.find(item => {
            return item.code.toLowerCase() === body.referralCode.toLowerCase()
        });

        //if no referral with the referralCode provided by user
        if (!verifiedReferral) {
            return next({message: _errConstant.INVALID_REFERRAL_CODE, status: 422});
        }
        //get some detail
        let invitationId = verifiedReferral.invitationId;
        let otherEmail = verifiedReferral.email;

        //get invitation detail with invitationId and email(we'll not get alredy accepted or rejected invitation)
        let invitation = await getInvitationWithEmail(invitationId, otherEmail);
        //check if invite send by self
        if (req.user.id === invitation.userId) {
            return next({message: _errConstant.SELF_INVITE_ACCEPT, status: 400})
        }

        //check if already a friend
        let friendParam = {
            searchParams: {
                [Op.and]: [{userMetaId: userMeta.id}, {friendMetaId: invitation.userMetaId}]
            }
        };
        let isFriend = await FriendRepo.friendDetail(friendParam);
        if (isFriend) {
            return next({message: _errConstant.ALREADY_CONTACT, status: 409}, null);
        }

        //create friend with userId(got from invitation table), friendId (from req.user) and vice versa.
        let friends = [
            {
                userMetaId: invitation.userMetaId, userId: invitation.userId,
                friendMetaId: userMeta.id, friendId: req.user.id
            },
            {
                userMetaId: userMeta.id, userId: req.user.id,
                friendMetaId: invitation.userMetaId, friendId: invitation.userId
            },
        ];

        await FriendRepo.friendBulkCreate(friends);

        //update user repo coz invitation accept for referral user
        await UserRepo.userCoinsUpdate(invitation.userId, _appConstant.INVITATION_ACCEPTED_COINS);

        coinTransactionData.push({
            userId: invitation.userId,
            type: _appConstant.COINS_TRANSACTION_TYPE_INVITATION_ACCEPT,
            coins: _appConstant.INVITATION_ACCEPTED_COINS
        });

        //get all first degree friends of invitation sender to allocate coins
        let firstDegreeFriends = await FriendRepo.friendList({
            searchParams: {
                userId: invitation.userId,
                friendId: {[Op.ne]: invitation.userId}
            }
        });
        let friendIds = [];
        firstDegreeFriends.forEach(frnd => {
            friendIds.push(frnd.friendId);
            coinTransactionData.push(
                {
                    userId: frnd.friendId,
                    type: _appConstant.COINS_TRANSACTION_TYPE_FRIEND_INVITATION_ACCEPT,
                    coins: _appConstant.FRIEND_INVITATION_ACCEPTED_COINS
                }
            )
        })

        await UserRepo.userCoinsUpdate(friendIds, _appConstant.FRIEND_INVITATION_ACCEPTED_COINS);
        //create coinTransaction log
        await CoinTransactionRepo.coinTransactionBulkCreate(coinTransactionData);

        //send notification to actionOwner about Invitation Accept
        await NotificationRepo.notificationCreate({
            type: _appConstant.NOTIFICATION_TYPE_INVITATION_ACCEPT, actionOwnerId: req.user.id, typeId: invitation.id,
            userId: invitation.userId, text: req.user.name + ' accepted your invitation'
        });

        console.log("### CREATING CONNECTIONS FOR userId %s with inviterId %s FROM ACCEPT-INVITATION-WITH-REFERRAL", req.user.id, invitation.userId);
        // mapping connections
        ConnectionService.createConnections(invitation.userId, req.user.id);

        let emailDetail;
        //check for email existance in user Table
        emailDetail = await UserRepo.userDetail({searchParams: {email: otherEmail}});
        if (!emailDetail) {
            //check for email existance in userEmail Table
            emailDetail = await UserEmailRepo.userEmailDetail({searchParams: {email: otherEmail}});
            if (!emailDetail) {
                //add this new email to user OtherEmails
                await UserEmailRepo.userEmailCreate({userId: req.user.id, email: body.email});
            }
        }

        //update invitation table (update friendMetaId, friendId, accepted at)
        await InvitationRepo.invitationUpdate({
            id: invitation.id, email: invitation.email
        }, {friendMetaId: userMeta.id, friendId: req.user.id, acceptedAt: moment()});

        //update Refferral table (with updating usedAt)
        await ReferralRepo.referralUpdate({id: verifiedReferral.id}, {usedAt: moment()});

        next();
    } catch (err) {
        return next(err);
    }
}

//get invitation detail with invitationId & email (coz friendId is null in invitation table in this case.)
async function getInvitationWithEmail(invitationId, email) {

    let invitation = await InvitationRepo.invitationDetail({
        searchParams: {
            id: invitationId,
            email: email
        }
    });

    if (!invitation) {
        throw {message: _errConstant.NO_INVITATION, status: 400};
    }
    if (invitation.rejectedAt) {
        throw {message: _errConstant.INVITATION_ALREADY_REJECTED, status: 400};
    }
    if (invitation.acceptedAt) {
        throw {message: _errConstant.INVITATION_ALREADY_ACCEPTED, status: 400};
    }

    return invitation;
}

/* send friend request to a conversation group member */
async function sendInviteToConversationGroupMember(req, res, next) {
    let user = req.user;

    try {
        /* Get friend details */
        let friend = await UserRepo.userDetail({searchParams: {id: req.params.userId}});
        if (!friend) {
            return next({message: _errConstant.NO_USER, status: 400});
        }
        /* create invitation info */
        let invitationInfo = {
            userMetaId: user.userMetaId,
            userId: user.id,
            friendMetaId: friend.userMetaId,
            friendId: friend.id,
            sendAt: moment()
        };

        let friendCount = await FriendRepo.friendCount({userId: user.id});
        /* check max friend limit exceeds */
        if (friendCount >= _appConstant.MAX_FRIENDS) {
            return next({message: _errConstant.MAX_FRIEND_LIMIT, status: 400});
        }

        /* check if already friends */
        let friendParam = {
            searchParams: {
                [Op.and]: [{userId: user.id}, {friendId: friend.id}]
            }
        };
        let isFriend = await FriendRepo.friendDetail(friendParam);
        if (isFriend) {
            return next({message: _errConstant.ALREADY_CONTACT, status: 409}, null);
        }

        let invitationSearchParams = {
            [Op.or]: [
                {userId: user.id, friendId: friend.id},
                {userId: friend.id, friendId: user.id}
            ],
            rejectedAt: null,
            acceptedAt: null
        };

        let invitation = await InvitationRepo.invitationDetail({searchParams: invitationSearchParams});

        if (invitation) {
            if (!invitation.isCleared) {
                return next({message: _errConstant.INVITATION_ALREADY_SENT, status: 400});
            }
            //else set invitation isCleared to false
            await InvitationRepo.invitationUpdate({id: invitation.id}, {isCleared: false});
        } else {
            invitation = await InvitationRepo.invitationCreate(invitationInfo);
        }

        await NotificationRepo.notificationCreate({
            type: _appConstant.NOTIFICATION_TYPE_INVITATION, actionOwnerId: req.user.id, typeId: invitation.id,
            userId: req.params.userId, text: req.user.name + ' send you an invitation'
        });

        res.data = {invitation: invitation.toJSON()};
        return next();
    } catch (err) {
        return next(err);
    }
}
