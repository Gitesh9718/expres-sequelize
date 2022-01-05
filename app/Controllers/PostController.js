/* global _appConstant, _errConstant */
'use strict';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { post, user, hashTag, file, favourite, postLike } = require('models');

const PostRepo = require('app/Repositories/PostRepository');
// const PostLikeRepo = require('app/Repositories/PostLikeRepository');
const CommentRepo = require('app/Repositories/CommentRepository');
const FriendRepo = require('app/Repositories/FriendRepository');
const FavouriteRepo = require('app/Repositories/FavouriteRepository');
const HashTagService = require('app/Services/HashTagService');
const NotificationRepo = require('app/Repositories/NotificationRepository');
const ConnectionRepo = require('app/Repositories/ConnectionRepository');
const AwardMappingRepo = require('app/Repositories/AwardMappingRepository');
const CoinTransactionRepo = require('app/Repositories/CoinTransactionRepository');
const UserRepo = require('app/Repositories/UserRepository');
const UserDashboardService = require('app/Services/UserDashboardService');
const BlockRepo = require('app/Repositories/BlockRepository');

module.exports = {
    create: create,
    myPosts: myPosts,
    favouritePostsCount: favouritePostsCount,
    favouritePosts: favouritePosts,
    getAll: getAll,
    repost: repost,
    deletePost: deletePost,
    update: update,
    detail: detail,
    getMeta: getMeta,
    storeLike: storeLike,
    getPostLikersList: getPostLikersList
};

async function create (req, res, next) {
    const user = req.user;
    const postInfo = {
        ...req.body,
        userId: user.id
    };

    if (!req.body.title) {
        return next({
            message: _errConstant.REQUIRED_POST_TITLE,
            status: 400
        });
    }

    try {
        const post = await PostRepo.postCreate(postInfo);

        if (!post.isApplicableForChat) {
            /* update friend's postCount and lastPostAt */
            await FriendRepo.friendPostCountAndLastPostUpdate(user.id);
        }

        if (postInfo.hasOwnProperty('hashTags')) {
            await HashTagService.mapHashTags(post, postInfo['hashTags']);
        }

        res.data = post.toJSON();

        next();
    } catch (err) {
        next(err);
    }
}

async function myPosts (req, res, next) {
    let loggedInUser = req.user;
    let friendId = null;
    // in case of other profile
    // check connection degree
    if (req.params.userId && parseInt(loggedInUser.id) !== parseInt(req.params.userId)) {
        friendId = req.params.userId;

        const connection = await ConnectionRepo.connectionDetail({
            searchParams: {
                [Op.or]: [
                    {
                        userId: loggedInUser.id,
                        friendId: friendId
                    },
                    {
                        friendId: loggedInUser.id,
                        userId: friendId
                    }
                ]
            },
            order: [
                ['degree', 'ASC'],
                ['isFavorite', 'DESC']
            ]
        });
        // console.log('logged in user ===> ', loggedInUser.id, 'friendId ===> ', friendId, connections.length);

        if (!connection || (connection && connection.degree === 3)) {
            res.data = {
                items: [],
                paginate: { total: 0 }
            };

            return next();
        }

        loggedInUser = { id: req.params.userId };
    }

    // check for blocked users
    if (friendId) {
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
                message: _errConstant.USER_BLOCKED_BY_YOU,
                status: 400
            });
        } else if (blockData && parseInt(blockData.userId) === parseInt(req.params.userId)) {
            return next({
                message: _errConstant.BLOCKED_BY_USER,
                status: 400
            });
        }
    }

    const postParams = {
        // attributes: {
        //     include: [
        //         [Sequelize.literal('(select COUNT(*) from comments where comments.postId = post.id and comments.deletedAt is null)'), 'commentCount'],
        //         [Sequelize.literal('(select COUNT(*) from favourites where favourites.postId = post.id and deletedAt is null)'), 'favouriteCount']
        //     ]
        // },
        searchParams: {
            userId: loggedInUser.id
        },
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
        order: [
            ['createdAt', 'DESC']
        ],
        limit: req.limit,
        offset: req.skip
    };

    try {
        const posts = await PostRepo.postList(postParams);
        const newPosts = [];

        posts.rows.forEach(p => {
            p = p.toJSON();
            p['isFavourite'] = !!p['isFavourite'].length;
            p['liked'] = false;
            newPosts.push(p);
        });

        /* reset friend's postCount and lastPostAt */
        if (friendId !== null) {
            const searchParams = {
                userId: req.user.id,
                friendId: friendId
            };

            const data = {
                postCount: 0
                // lastPostAt: null
            };

            await FriendRepo.friendUpdate(searchParams, data);
        }

        res.data = {
            items: newPosts,
            paginate: { total: posts.count }
        };

        return next();
    } catch (err) {
        next(err);
    }
}

async function favouritePostsCount (req, res, next) {
    const loggedInUser = req.user;
    const postSearchParams = {
        userId: loggedInUser.id
    };
    const blockedPostIds = [];

    try {
        const blockedUserList = await BlockRepo.getAllBlockedUsers(loggedInUser.id);
        if (blockedUserList.length) {
            // get posts of blocked users
            const posts = await PostRepo.postList({ searchParams: { userId: blockedUserList } });

            if (posts && posts.length) {
                posts.forEach(p => {
                    blockedPostIds.push(p.id);
                });
            }
        }

        if (blockedPostIds.length) {
            postSearchParams['postId'] = { [Op.notIn]: blockedPostIds };
        }
        const count = await FavouriteRepo.favouriteCount(postSearchParams);

        res.data = { count: count };

        next();
    } catch (err) {
        next(err);
    }
}

async function favouritePosts (req, res, next) {
    const loggedInUser = req.user;

    const postParams = {
        // attributes: {
        //     include: [
        //         [Sequelize.literal('(select COUNT(*) from comments where comments.postId = post.id and comments.deletedAt is null)'), 'commentCount'],
        //         [Sequelize.literal('(select COUNT(*) from favourites where favourites.postId = post.id and deletedAt is null)'), 'favouriteCount']
        //     ]
        // },
        searchParams: {},
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
                model: favourite,
                where: { userId: loggedInUser.id }
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
        order: [
            ['createdAt', 'DESC']
        ],
        limit: req.limit,
        offset: req.skip
    };
    try {
        const blockedUserList = await BlockRepo.getAllBlockedUsers(req.user.id);

        console.log('block list --> ', blockedUserList);
        if (blockedUserList.length) {
            postParams['searchParams'] = {
                userId: { [Op.notIn]: blockedUserList }
            };
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

        next();
    } catch (err) {
        next(err);
    }
}

async function getAll (req, res, next) {
    const loggedInUser = req.user;
    let posts;

    // all user ids (loggedin user, friends, featured of friends)
    const userIds = [loggedInUser.id];

    const postParams = {
        /* attributes: {
            include: [
                [Sequelize.literal('(select COUNT(*) from comments where comments.postId = post.id and comments.deletedAt is null)'), 'commentCount'],
                [Sequelize.literal('(select COUNT(*) from favourites where favourites.postId = post.id and deletedAt is null)'), 'favouriteCount']
            ]
        }, */
        searchParams: {
            [Op.and]: [
                { userId: userIds },
                { isApplicableForChat: false }
            ]

        },
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
                model: favourite,
                where: { userId: loggedInUser.id },
                required: false
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
        order: [
            ['createdAt', 'DESC']
        ],
        limit: req.limit,
        offset: req.skip
    };

    try {
        const blockedUserList = await BlockRepo.getAllBlockedUsers(req.user.id);

        console.log('block usr list -> ', blockedUserList);
        const friends = await FriendRepo.friendList({
            searchParams: {
                [Op.and]: [
                    { userId: loggedInUser.id },
                    { friendId: { [Op.notIn]: blockedUserList } }
                ]
            },
            attributes: ['friendId']
        });

        friends.forEach(frnd => {
            userIds.push(frnd.friendId);
        });

        const friendsFeatured = await FriendRepo.friendList({
            searchParams: {
                [Op.and]: [
                    { userId: loggedInUser.id },
                    { friendId: { [Op.notIn]: blockedUserList } },
                    { isFavorite: true }
                ]
            },
            attributes: ['friendId']
        });

        friendsFeatured.forEach(ftr => {
            if (userIds.indexOf(ftr.friendId) === -1) {
                userIds.push(ftr.friendId);
            }
        });
        console.log('final-> ', userIds);
        posts = await PostRepo.postList(postParams);
        const newPosts = [];
        const parentPostUserMap = {};
        const forwardPostUserIds = [];

        posts.rows.forEach((p, index) => {
            p = p.toJSON();
            p['isFavourite'] = !!p['isFavourite'].length;
            p['isMyFavourite'] = !!p['favourites'].length;
            delete p['favourites'];
            p['liked'] = false;
            newPosts.push(p);
            if (p.parentId && p.parentPost) {
                parentPostUserMap[p.parentId] = index;
                forwardPostUserIds.push(p.parentPost.userId);
            }
        });

        if (Object.values(parentPostUserMap).length) {
            console.log(parentPostUserMap);
            // Get connections of all parent post users
            const connections = await ConnectionRepo.connectionList({
                searchParams: {
                    userId: loggedInUser.id,
                    friendId: { [Op.in]: forwardPostUserIds }
                },
                order: [
                    ['degree', 'ASC']
                ]
            });
            const connectionMap = {};
            connections.forEach(connection => {
                connectionMap[connection.friendId] = connection.degree;
            });

            Object.values(parentPostUserMap).forEach(i => {
                const post = newPosts[i];
                if (post.parentPost) {
                    if (!(Object.prototype.hasOwnProperty.call(connectionMap, post.parentPost.userId) && connectionMap[post.parentPost.userId] < 2)) {
                        post.parentPost.intention = null;
                        post.parentPost.desiredOutput = null;
                        post.parentPost.agenda = null;
                        post.parentPost.rules = null;
                        post.parentPost.timing = null;
                    }
                }
            });
        }

        res.data = {
            items: newPosts,
            paginate: { total: posts.count }
        };
        return next();
    } catch (err) {
        next(err);
    }
}

async function repost (req, res, next) {
    const data = {
        userId: req.user.id,
        parentId: req.params.id
    };

    try {
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.id } });

        if (!originalPost) {
            return next({
                message: _errConstant.NO_PUBLICATION,
                status: 400
            });
        }

        data['type'] = originalPost.type;

        await PostRepo.postCreate(data);

        /* increment repostedCount for original post */
        await PostRepo.postUpdate({ id: req.params.id }, {
            repostedCount: Sequelize.literal('repostedCount + 1')
        });

        await NotificationRepo.notificationCreate({
            type: _appConstant.NOTIFICATION_TYPE_FORWARD,
            postId: originalPost.id,
            actionOwnerId: data.userId,
            userId: originalPost.userId,
            text: req.user.name + ' reposted your publication'
        });

        // Post reposted event trigger for user dashboar
        const eventData = {
            userId: originalPost.userId,
            type: _appConstant.DASHBOARD_POST_REPOSTED,
            postId: originalPost.id
        };

        UserDashboardService.DailyPostDashboardDataCreateORIncrement(eventData);

        next();
    } catch (err) {
        next(err);
    }
}

async function deletePost (req, res, next) {
    try {
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.id } });
        if (!originalPost) {
            return next({
                message: _errConstant.NO_PUBLICATION,
                status: 400
            });
        }

        if (originalPost.userId !== req.user.id) {
            return next({
                message: _errConstant.NO_AUTH,
                status: 400
            });
        }

        // get created time of original post & current date (need only if original post is reposted)
        const orgPostcreateAt = new Date(originalPost.createdAt);
        const currentDate = new Date();

        /* parent post id of original post (if any) */
        const parentPostId = originalPost.parentId;

        const postIds = [originalPost.id];

        const childPosts = await PostRepo.postList({ searchParams: { parentId: originalPost.id } });

        childPosts.forEach(post => {
            postIds.push(post.id);
        });

        await PostRepo.postDelete({ [Op.or]: [{ id: originalPost.id }, { parentId: originalPost.id }] });

        /* decrement count if deleted post is a repost */
        if (parentPostId) {
            // get the parentPost
            const parentPost = await PostRepo.postDetail({ searchParams: { id: parentPostId } });

            await PostRepo.postUpdate({ id: parentPost.id }, {
                repostedCount: Sequelize.literal('repostedCount - 1')
            });
            // Post reposted decrement event trigger for user dashboard
            const eventData = {
                userId: parentPost.userId,
                type: _appConstant.DASHBOARD_POST_REPOSTED,
                postId: parentPost.id
            };

            if (orgPostcreateAt.toDateString() === currentDate.toDateString()) {
                UserDashboardService.DailyPostDashboardDataDecrement(eventData);
            }
        }

        // console.log('==>', postIds);
        await CommentRepo.commentDelete({ postId: { [Op.in]: postIds } });

        await NotificationRepo.notificationDelete({ postId: { [Op.in]: postIds } });

        next();
    } catch (err) {
        next(err);
    }
}

async function update (req, res, next) {
    try {
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.id } });
        if (!originalPost) {
            return next({
                message: _errConstant.NO_PUBLICATION,
                status: 400
            });
        }

        if (originalPost.userId !== req.user.id) {
            return next({
                message: _errConstant.NO_AUTH,
                status: 400
            });
        }

        await PostRepo.postUpdate({ id: originalPost.id }, req.body);

        await HashTagService.mapHashTags(originalPost, req.body['hashTags'] || []);

        next();
    } catch (err) {
        next(err);
    }
}

async function detail (req, res, next) {
    try {
        const postParams = {
            // attributes: {
            //     include: [
            //         [Sequelize.literal('(select COUNT(*) from comments where comments.postId = post.id and comments.deletedAt is null)'), 'commentCount'],
            //         [Sequelize.literal('(select COUNT(*) from favourites where favourites.postId = post.id and deletedAt is null)'), 'favouriteCount']
            //     ]
            // },
            searchParams: { id: req.params.id },
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
                    model: favourite,
                    where: { userId: req.user.id },
                    required: false
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
            ]
        };
        let originalPost = await PostRepo.postDetail(postParams);
        if (!originalPost) {
            return next({
                message: _errConstant.PUBLICATION_DELETED,
                status: 400
            });
        }
        originalPost = originalPost.toJSON();
        originalPost['isFavourite'] = !!originalPost['isFavourite'].length;
        originalPost['isMyFavourite'] = !!originalPost['favourites'].length;
        delete originalPost['favourites'];
        originalPost['liked'] = false;
        res.data = originalPost;

        next();
    } catch (err) {
        next(err);
    }
}

async function getMeta (req, res, next) {
    const { getMetadata } = require('page-metadata-parser');
    const domino = require('domino');
    const fetch = require('node-fetch');

    const url = req.searchQuery.url;
    if (!url) {
        return next({
            message: _errConstant.REQUIRED_URL,
            status: 400
        });
    }

    const response = await fetch(url);
    const html = await response.text();
    const doc = domino.createWindow(html).document;

    const meta = getMetadata(doc, url);

    if (!meta.image) {
        meta['image'] = null;
    }
    if (!meta.title) {
        meta['title'] = null;
    }

    res.data = { meta: meta };
    next();
}

async function storeLike (req, res, next) {
    const body = {
        type: _appConstant.AWARD_TYPE_POST,
        typeId: req.params.id,
        presenterId: req.user.id
    };

    try {
        // get presenter's current coins
        const presenterCoins = req.user.coins;
        // check if coins are not sufficient
        if (presenterCoins + _appConstant.AWARD_ALLOCATE_COINS < 0) {
            return next({
                message: _errConstant.NOT_ENOUGH_COINS,
                status: 400
            });
        }

        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.id } });
        if (!originalPost) {
            return next({
                message: _errConstant.NO_PUBLICATION,
                status: 400
            });
        }
        const userId = originalPost.userId;
        body['userId'] = userId;
        if (userId === req.user.id) {
            return next({
                message: _errConstant.SELF_AWARD_ERROR,
                status: 400
            });
        }

        // check if already gave like award
        const likePost = await AwardMappingRepo.awardMappingDetail({ searchParams: body });

        if (likePost) {
            await AwardMappingRepo.awardMappingUpdate({ id: likePost.id }, { count: Sequelize.literal('count + 1') });
        } else {
            await AwardMappingRepo.awardMappingCreate(body);
        }

        // update totalAwards on post
        await PostRepo.postUpdate({ id: req.params.id }, { totalAwards: Sequelize.literal('totalAwards + 1') });

        // update totalAwards for post user
        await UserRepo.userUpdate({ id: originalPost.userId }, {
            totalAwards: Sequelize.literal('totalAwards + 1')
        });

        // update users, deduct coins for giving award
        await UserRepo.userCoinsUpdate(req.user.id, _appConstant.AWARD_ALLOCATE_COINS);

        // create coinTransaction log
        const coinTransactionObj = {
            userId: req.user.id,
            type: _appConstant.COINS_TRANSACTION_TYPE_AWARD_POST,
            typeId: req.params.id,
            coins: _appConstant.AWARD_ALLOCATE_COINS
        };

        await CoinTransactionRepo.coinTransactionCreate(coinTransactionObj);

        // send notification to user for receiving award on publication
        await NotificationRepo.notificationCreate({
            type: _appConstant.NOTIFICATION_TYPE_AWARD_POST,
            postId: originalPost.id,
            actionOwnerId: req.user.id,
            userId: originalPost.userId,
            text: req.user.name + ' has given award on your publication'
        });

        // Post awarded event trigger for user dashboard
        const eventData = {
            userId: originalPost.userId,
            type: _appConstant.DASHBOARD_POST_AWARDED,
            postId: originalPost.id
        };

        UserDashboardService.DailyPostDashboardDataCreateORIncrement(eventData);

        return next();
    } catch (err) {
        return next(err);
    }
}

async function getPostLikersList (req, res, next) {
    const postLikeParam = {
        searchParams: {
            type: _appConstant.AWARD_TYPE_POST,
            typeId: req.params.id
        },
        attributes: {
            include: [
                [Sequelize.literal(`(select SUM(count) from awardMappings where awardMappings.type = \'POST\' and awardMappings.typeId = ${req.params.id} and deletedAt is null)`), 'totalLikesCount']
            ]
        },
        include: [
            {
                model: user,
                as: 'presentingUser',
                attributes: { exclude: _appConstant.USER_HIDDEN_FIELDS },
                include: [{
                    model: file,
                    as: 'profileImage'
                }]
            }
        ],

        limit: req.limit,
        offset: req.skip
    };
    try {
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.id } });
        if (!originalPost) {
            return next({
                message: _errConstant.NO_PUBLICATION,
                status: 400
            });
        }

        const postLikers = await AwardMappingRepo.awardMappingList(postLikeParam);
        if (!postLikers.rows.length) {
            res.data = {
                items: [],
                paginate: { total: 0 }
            };
            return next();
        }
        const newPostLikers = [];
        postLikers.rows.forEach(postLike => {
            newPostLikers.push(postLike.presentingUser);
        });

        res.data = {
            totalLikesCount: postLikers.rows[0].dataValues.totalLikesCount,
            items: newPostLikers,
            paginate: { total: newPostLikers.length }
        };
        return next();
    } catch (err) {
        return next(err);
    }
}
