/* global _appConstant, _errConstant */

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('models');
const { file, friend, user } = require('models/index');

const moment = require('moment');
const FriendRepo = require('app/Repositories/FriendRepository');
const ConversationMessageRepo = require('app/Repositories/ConversationMessageRepository');
const ConnectionService = require('app/Services/ConnectionService');
const NotificationRepo = require('app/Repositories/NotificationRepository');
const UserRepo = require('app/Repositories/UserRepository');
const BlockRepo = require('app/Repositories/BlockRepository');

module.exports = {
    getAll: getAll,
    remove: remove,
    feature: feature,
    getMutualFriends: getMutualFriends,
    getFeatureFriends: getFeatureFriends,
    friendsDailyPostCount: friendsDailyPostCount
};

async function getAll (req, res, next) {
    const loggedInUser = req.user;

    const friendSearchParams = {
        searchParams: { userId: loggedInUser.id },
        include: [
            {
                model: user,
                attributes: _appConstant.USER_BASIC_INFO_FIELDS,
                include: [
                    {
                        model: friend,
                        where: { /* friendId: {[Op.ne]: loggedInUser.id}, */ isFavorite: true },
                        include: [
                            {
                                model: user,
                                attributes: _appConstant.USER_BASIC_INFO_FIELDS,
                                include: [{ model: file, as: 'profileImage' }]
                            }
                        ],
                        limit: _appConstant.MAX_FEATURE_FRIENDS
                    },
                    { model: file, as: 'profileImage' }
                ]
            }
        ],
        limit: req.limit,
        offset: req.skip
    };

    try {
        const friends = await FriendRepo.friendList(friendSearchParams);

        const blockUserList = await BlockRepo.getAllBlockedUsers(req.user.id);

        console.log('block list ->', blockUserList);
        const nFriends = [];

        friends.rows.forEach(frnd => {
            frnd = frnd.toJSON();
            frnd['isBlocked'] = false;
            if (blockUserList.length && blockUserList.indexOf(frnd.friendId) !== -1) {
                frnd['isBlocked'] = true;
            }

            if (frnd.user && frnd.user.friends) {
                frnd.user['Friends'] = frnd.user.friends;
            }
            nFriends.push(frnd);
        });

        res.data = { items: nFriends, paginate: { total: friends.count } };

        return next();
    } catch (err) {
        next(err);
    }
}

async function remove (req, res, next) {
    const user = req.user;
    const friendId = req.params.id;
    const body = req.body;

    try {
        const friendParam = {
            searchParams: {
                userId: user.id, friendId: friendId
            }
        };

        const friend = await FriendRepo.friendDetail(friendParam);

        if (!friend) {
            return next({ message: _errConstant.NO_FRIEND, status: 400 });
        }

        await FriendRepo.friendDelete({
            [Op.or]: [
                { userId: user.id, friendId: friendId },
                { userId: friendId, friendId: user.id }
            ]
        });

        if (body.hasOwnProperty('message') && body.message.length) {
            await ConversationMessageRepo.sendMessageToUser(user, friendId, { text: body['message'] });
        }

        console.log('### REMOVING FRIEND CONNECTIONS FOR ==> ', friend);
        // mapping connections
        ConnectionService.removeConnections(friend);

        return next();
    } catch (err) {
        next(err);
    }
}

async function feature (req, res, next) {
    const user = req.user;
    const friendId = req.params.id;
    try {
        const friend = await FriendRepo.friendDetail({ searchParams: { userId: user.id, friendId: friendId } });

        if (!friend) {
            return next({ message: _errConstant.INVALID_FRIENDS, status: 400 });
        }

        if (!friend.isFavorite) {
            const count = await FriendRepo.friendCount({ userId: user.id, isFavorite: true });
            if (count >= _appConstant.MAX_FEATURE_FRIENDS) {
                return next({
                    message: _errConstant.FRIEND_LIST_FULL,
                    status: 400
                });
            }
        }

        await FriendRepo.friendUpdate({ userId: user.id, friendId: friendId }, { isFavorite: !friend.isFavorite });

        if (!friend.isFavorite) {
            await NotificationRepo.notificationCreate({
                type: _appConstant.NOTIFICATION_TYPE_FEATURE,
                actionOwnerId: req.user.id,
                userId: friendId,
                text: "You've been featured by " + req.user.name
            });
        }

        return next();
    } catch (err) {
        next(err);
    }
}

async function getMutualFriends (req, res, next) {
    const loggedInUser = req.user;

    const friendSearchParams = {
        attributes: [
            'friendId',
            [Sequelize.fn('COUNT', Sequelize.col('userId')), 'count']
        ],
        include: [
            {
                model: user,
                attributes: { exclude: ['password', 'publicKey', 'privateKey'] },
                include: [{ model: file, as: 'profileImage' }]
            }
        ],
        searchParams: { userId: { [Op.in]: [loggedInUser.id, req.params.userId] } },
        group: ['friendId'],
        having: { count: 2 },
        limit: req.limit,
        offset: req.skip
    };

    try {
        const friends = await FriendRepo.friendList(friendSearchParams);

        const mutualFriends = [];

        friends.rows.forEach(frnd => {
            frnd = frnd.toJSON();
            mutualFriends.push(frnd.user);
        });

        res.data = { items: mutualFriends };

        return next();
    } catch (err) {
        next(err);
    }
}

async function getFeatureFriends (req, res, next) {
    const loggedInUser = req.user;

    const friendSearchParams = {
        searchParams: { userId: loggedInUser.id, isFavorite: 1 },
        include: [
            {
                model: user,
                attributes: _appConstant.USER_BASIC_INFO_FIELDS,
                include: [
                    {
                        model: friend,
                        where: { friendId: { [Op.ne]: loggedInUser.id }, isFavorite: 1 },
                        include: [
                            {
                                model: user,
                                attributes: _appConstant.USER_BASIC_INFO_FIELDS,
                                include: [{ model: file, as: 'profileImage' }]
                            }
                        ],
                        limit: 3
                    },
                    { model: file, as: 'profileImage' }
                ]
            }
        ],
        limit: req.limit,
        offset: req.skip
    };

    try {
        const friends = await FriendRepo.friendList(friendSearchParams);

        res.data = { items: friends.rows, paginate: { total: friends.count } };

        return next();
    } catch (err) {
        next(err);
    }
}

/* friends daily posts */

async function friendsDailyPostCount (req, res, next) {
    const loggedInUser = req.user;

    const friendsPostSearchParams = {
        searchParams: { userId: loggedInUser.id },
        include: [
            {
                model: user,
                attributes: ['id', 'name', 'image'],
                include: [
                    {
                        model: friend,
                        where: { isFavorite: true },
                        include: [
                            {
                                model: user,
                                attributes: _appConstant.USER_BASIC_INFO_FIELDS,
                                include: [{ model: file, as: 'profileImage' }]
                            }
                        ],
                        limit: 30
                    },
                    { model: file, as: 'profileImage' }
                ]
            }
        ],
        order: [['lastPostAt', 'DESC']],
        limit: req.limit,
        offset: req.skip
    };
    try {
        const friends = await FriendRepo.friendList(friendsPostSearchParams);
        const userDetail = await UserRepo.userDetail({
            attributes: ['id', 'name', 'image',
                [Sequelize.literal('(select COUNT(1) from posts where posts.userId = user.id and date(createdAt)= CURDATE() and deletedAt is null)'), 'postCount']
            ],
            searchParams: { id: loggedInUser.id },
            include: [
                {
                    model: friend,
                    where: { isFavorite: true },
                    include: [
                        {
                            model: user,
                            attributes: _appConstant.USER_BASIC_INFO_FIELDS,
                            include: [{ model: file, as: 'profileImage' }]
                        }
                    ],
                    limit: 4
                },
                { model: file, as: 'profileImage' }
            ]
        });

        const newFriends = [];
        friends.rows.forEach(row => {
            row = row.toJSON();
            const friendCreatedAt = new Date(row.createdAt).setHours(0, 0, 0, 0);
            const curDate = new Date().setHours(0, 0, 0, 0);
            if (friendCreatedAt === curDate && row.postCount === 0) {
                row.createdAt = moment(row.createdAt).endOf('day');
            } else {
                row.createdAt = row.lastPostAt;
            }
            row.user['postCount'] = row['postCount'];
            newFriends.push(row);
        });

        newFriends.unshift({
            id: 1,
            postCount: userDetail['postCount'],
            user: userDetail,
            createdAt: moment().add(1, 'd').format(),
            lastPostAt: moment().add(1, 'd').format()
        });

        res.data = { items: newFriends, paginate: { total: friends.count } };
        return next();
    } catch (err) {
        next(err);
    }
}
