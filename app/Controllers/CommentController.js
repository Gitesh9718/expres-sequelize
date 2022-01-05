/* global _appConstant, _errConstant */

'use strict';
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { user, file, comment, commentLike } = require('models');
const CommentRepo = require('app/Repositories/CommentRepository');
const CommentLikeRepo = require('app/Repositories/CommentLikeRepository');
const NotificationRepo = require('app/Repositories/NotificationRepository');
const PostRepo = require('app/Repositories/PostRepository');
const UserRepo = require('app/Repositories/UserRepository');
const AwardMappingRepo = require('app/Repositories/AwardMappingRepository');
const CoinTransactionRepo = require('app/Repositories/CoinTransactionRepository');
const UserDashboardService = require('app/Services/UserDashboardService');

module.exports.store = async function (req, res, next) {
    const body = req.body;

    if (!body.text) {
        return next({ message: _errConstant.REQUIRED_CONTRIBUTION_TXT, status: 400 });
    }

    body['postId'] = req.params.postId;
    body['userId'] = req.user.id;

    try {
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.postId } });

        if (!originalPost) {
            return next({ message: _errConstant.NO_PUBLICATION, status: 400 });
        }

        const comment = await CommentRepo.commentCreate(body);

        /* increment totalComment for post */
        await PostRepo.postUpdate({ id: req.params.postId }, {
            totalComments: Sequelize.literal('totalComments + 1')
        });

        if (originalPost.userId !== body.userId) {
            await NotificationRepo.notificationCreate({
                type: _appConstant.NOTIFICATION_TYPE_COMMENT,
                typeId: comment.id,
                postId: body['postId'],
                actionOwnerId: body['userId'],
                userId: originalPost.userId,
                text: req.user.name + ' contributed - ' + body.text
            });
        }

        // Post commented event trigger for user dashboard
        const eventData = {
            userId: originalPost.userId,
            type: _appConstant.DASHBOARD_POST_COMMENTED,
            postId: originalPost.id
        };

        UserDashboardService.DailyPostDashboardDataCreateORIncrement(eventData);

        next();
    } catch (err) {
        next(err);
    }
};

module.exports.reply = async function (req, res, next) {
    const body = req.body;

    if (!body.text) {
        return next({ message: _errConstant.REQUIRED_CONTRIBUTION_TXT, status: 400 });
    }

    body['postId'] = req.params.postId;
    body['parentId'] = req.params.commentId;
    body['userId'] = req.user.id;

    try {
        // original post
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.postId } });
        if (!originalPost) {
            return next({ message: _errConstant.NO_PUBLICATION, status: 400 });
        }
        // original comment
        const originalComment = await CommentRepo.commentDetail({ searchParams: { id: body['parentId'] } });
        if (!originalComment) {
            return next({ message: _errConstant.INVALID_CONTRIBUTION_ID, status: 400 });
        }

        const comment = await CommentRepo.commentCreate(body);

        /* increment totalComment for post */
        await PostRepo.postUpdate({ id: req.params.postId }, {
            totalComments: Sequelize.literal('totalComments + 1')
        });

        await NotificationRepo.notificationCreate({
            type: _appConstant.NOTIFICATION_TYPE_COMMENT_REPLY,
            typeId: comment.id,
            postId: body['postId'],
            actionOwnerId: body.userId,
            userId: originalComment.userId,
            text: req.user.name + ' replied on your contribution'
        });

        // Post commented event trigger for user dashboard
        const eventData = {
            userId: originalPost.userId,
            type: _appConstant.DASHBOARD_POST_COMMENTED,
            postId: originalPost.id
        };

        UserDashboardService.DailyPostDashboardDataCreateORIncrement(eventData);

        next();
    } catch (err) {
        next(err);
    }
};

module.exports.list = async function (req, res, next) {
    const commentParams = {
        searchParams: { postId: req.params.postId, parentId: null },
        include: [
            { model: user, attributes: ['id', 'name', 'image'], include: [{ model: file, as: 'profileImage' }] },
            {
                model: comment,
                as: 'replies',
                include: [{
                    model: user,
                    attributes: ['id', 'name', 'image'],
                    include: [{ model: file, as: 'profileImage' }]
                }]
            },
            { model: commentLike, as: 'liked', where: { userId: req.user.id }, required: false }
        ],
        limit: req.limit,
        offset: req.skip
    };
    try {
        const comments = await CommentRepo.commentList(commentParams);
        const newComments = [];

        comments.rows.forEach(c => {
            c = c.toJSON();
            c['liked'] = false;
            newComments.push(c);
        });

        res.data = { items: newComments, paginate: { total: comments.count } };

        next();
    } catch (err) {
        next(err);
    }
};

// contributor list on a post
module.exports.getContributorsList = async function (req, res, next) {
    const postId = req.params.postId;

    const contributorParams = {
        searchParams: { postId: postId },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('userId')), 'userId']],
        isRaw: true
    };

    const userParams = {
        attributes: ['id', 'name', 'image'],
        include: { model: file, as: 'profileImage' },
        limit: req.limit,
        offset: req.skip
    };

    try {
        const post = await PostRepo.postDetail({ searchParams: { id: postId } });
        if (!post) {
            return next({ message: _errConstant.POST_NOT_FOUND, status: 400 });
        }
        const postUserId = post.userId;

        const contributors = await CommentRepo.commentList(contributorParams);
        const contributorIds = contributors.map(contributor => {
            return contributor.userId;
        });

        /* if (!contributorIds.length) {
            res.data = {items: [], paginate: {total: 0}};
        } */

        // add original post user id if not present already
        if (contributorIds.indexOf(postUserId) === -1) {
            contributorIds.push(postUserId);
        }

        userParams['where'] = { id: { [Op.in]: contributorIds } };
        const users = await UserRepo.userList(userParams);
        const userList = [];

        users.rows.forEach(usr => {
            const user = usr.toJSON();
            if (user.id === postUserId) {
                user['isPostCreator'] = true;
                userList.unshift(user);
            } else {
                user['isPostCreator'] = false;
                userList.push(user);
            }
        });

        res.data = { items: userList, paginate: { total: users.count } };

        return next();
    } catch (err) {
        return next(err);
    }
};

module.exports.markBestContribution = async function (req, res, next) {
    const postId = req.params.postId;
    const commentId = req.params.commentId;

    try {
        const post = await PostRepo.postDetail({ searchParams: { id: postId } });

        if (post.userId !== req.user.id) {
            return next({ message: _errConstant.NO_AUTH, status: 403 });
        }

        const markedComment = await CommentRepo.commentDetail({ searchParams: { postId: postId, isBestAnswer: true } });

        if (markedComment && markedComment.id === parseInt(commentId)) {
            return next({ message: _errConstant.ALREADY_MARKED, status: 400 });
        }

        // toggle isBestAnswer for coment
        await CommentRepo.commentUpdate({ id: commentId }, { isBestAnswer: true });

        if (post.status === _appConstant.POST_STATUS_OPEN) {
            await PostRepo.postUpdate({ id: postId }, { status: _appConstant.POST_STATUS_CLOSED });
        }

        // unmark previously marked comment
        if (markedComment) {
            await CommentRepo.commentUpdate({ id: markedComment.id }, { isBestAnswer: false });
        }

        return next();
    } catch (err) {
        return next(err);
    }
};

module.exports.destroy = async function (req, res, next) {
    const commentParams = {
        searchParams: { id: req.params.commentId }
    };

    try {
        const originalComment = await CommentRepo.commentDetail(commentParams);

        if (originalComment.userId !== req.user.id) {
            return next({ message: _errConstant.NO_AUTH, status: 400 });
        }
        // get created time of original comment & current date
        const commentCreateAt = new Date(originalComment.createdAt);
        const currentDate = new Date();

        /* get post id of original comment */
        const postId = originalComment.postId;

        const commentIds = [originalComment.id];

        const childComment = await CommentRepo.commentList({ searchParams: { parentId: originalComment.id } });

        childComment.forEach(cmnt => {
            commentIds.push(cmnt.id);
        });

        const commentDecrementBy = commentIds.length;

        /* delete original comment along with child comments */
        await CommentRepo.commentDelete({ id: commentIds });

        /* decrement totalComments count for deleted comment's post */
        await PostRepo.postUpdate({ id: postId }, {
            totalComments: Sequelize.literal(`totalComments - ${commentDecrementBy}`)
        });

        /* delete all notification */
        await NotificationRepo.notificationDelete({ typeId: commentIds });

        // Post commented event trigger for user dashboard
        const eventData = {
            type: _appConstant.DASHBOARD_POST_COMMENTED,
            postId: postId
        };

        if (commentCreateAt.toDateString() === currentDate.toDateString()) {
            UserDashboardService.DailyPostDashboardDataDecrement(eventData, commentDecrementBy);
        }

        next();
    } catch (err) {
        next(err);
    }
};

module.exports.storeLike = async function (req, res, next) {
    const body = {
        type: _appConstant.AWARD_TYPE_COMMENT,
        typeId: req.params.commentId,
        presenterId: req.user.id
    };

    try {
        // get presenter's current coins
        const presenterCoins = req.user.coins;
        // check if coins are not sufficient
        if (presenterCoins + _appConstant.AWARD_ALLOCATE_COINS < 0) {
            return next({ message: _errConstant.NOT_ENOUGH_COINS, status: 400 });
        }

        const originalComment = await CommentRepo.commentDetail({ searchParams: { id: req.params.commentId } });
        if (!originalComment) {
            return next({ message: _errConstant.NO_CONTRIBUTION, status: 400 });
        }
        const userId = originalComment.userId;
        body['userId'] = userId;
        if (userId === req.user.id) {
            return next({ message: _errConstant.SELF_AWARD_ERROR, status: 400 });
        }

        // check if already gave like award
        const likeComment = await AwardMappingRepo.awardMappingDetail({ searchParams: body });

        if (likeComment) {
            await AwardMappingRepo.awardMappingUpdate({ id: likeComment.id }, { count: Sequelize.literal('count + 1') });
        } else {
            await AwardMappingRepo.awardMappingCreate(body);
        }

        // update totalAwards on comments
        await CommentRepo.commentUpdate({ id: req.params.commentId }, { totalAwards: Sequelize.literal('totalAwards + 1') });

        // update totalAwards for commenter user
        await UserRepo.userUpdate({ id: originalComment.userId }, {
            totalAwards: Sequelize.literal('totalAwards + 1')
        });

        // update users, deduct coins for giving award
        await UserRepo.userCoinsUpdate(req.user.id, _appConstant.AWARD_ALLOCATE_COINS);

        // create coinTransaction log
        const coinTransactionObj = {
            userId: req.user.id,
            type: _appConstant.COINS_TRANSACTION_TYPE_AWARD_COMMENT,
            typeId: req.params.commentId,
            coins: _appConstant.AWARD_ALLOCATE_COINS
        };

        await CoinTransactionRepo.coinTransactionCreate(coinTransactionObj);

        // send notification to user for receiving award on publication
        await NotificationRepo.notificationCreate({
            type: _appConstant.NOTIFICATION_TYPE_AWARD_COMMENT,
            typeId: originalComment.id,
            postId: originalComment.postId,
            actionOwnerId: req.user.id,
            userId: originalComment.userId,
            text: req.user.name + ' has given award on your contribution'
        });

        return next();
    } catch (err) {
        return next(err);
    }
};

module.exports.getCommentLikersList = async function (req, res, next) {
    const commentLikeParam = {
        searchParams: { type: _appConstant.AWARD_TYPE_COMMENT, typeId: req.params.commentId },
        attributes: {
            include: [
                [Sequelize.literal(`(select SUM(count) from awardMappings where awardMappings.type = \'COMMENT\' and awardMappings.typeId = ${req.params.commentId} and deletedAt is null)`), 'totalLikesCount']
            ]
        },
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
        const originalComment = await CommentRepo.commentDetail({ searchParams: { id: req.params.commentId } });
        if (!originalComment) {
            return next({ message: _errConstant.NO_CONTRIBUTION, status: 400 });
        }

        const commentLikers = await AwardMappingRepo.awardMappingList(commentLikeParam);
        if (!commentLikers.rows.length) {
            res.data = { items: [], paginate: { total: 0 } };
            return next();
        }
        const newCommentLikers = [];
        commentLikers.rows.forEach(commentLike => {
            newCommentLikers.push(commentLike.presentingUser);
        });

        res.data = { totalLikesCount: commentLikers.rows[0].dataValues.totalLikesCount, items: newCommentLikers, paginate: { total: newCommentLikers.length } };
        return next();
    } catch (err) {
        return next(err);
    }
};
