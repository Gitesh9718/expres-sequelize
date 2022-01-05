/* global _appConstant, _errConstant */
'use strict';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');
const db = require('models');

const PostDashboardRepo = require('app/Repositories/UserPostDashboardRepository');
const UserNetworkAwardRepo = require('app/Repositories/UserNetworkAwardRepository');
const FriendRepo = require('app/Repositories/FriendRepository');
const UserAwardDashboardRepo = require('app/Repositories/UserAwardDashboardRepository');

const { user, post, file } = require('models');

module.exports = {
    getUserDashboardData: getUserDashboardData
};

async function getUserDashboardData (req, res, next) {
    let dashboardType = 'user';
    if (req.searchQuery.type && req.searchQuery.type === 'network') {
        dashboardType = 'network';
    }

    const dashboardData = {
        firstMostAwardedUser: null,
        secondMostAwardedUser: null,
        thirdMostAwardedUser: null,
        firstMostFeaturedUser: null,
        secondMostFeaturedUser: null,
        thirdMostFeaturedUser: null,
        mostCommentedPost: null,
        mostRepostedPost: null,
        mostForwardedPost: null,
        mostBookmarkedPost: null,
        mostAwardedPost: null,
        mostTrendingPost: null,
        awardsGiven: 0,
        awardsReceived: req.user.totalAwards
    };

    const userIds = [req.user.id];
    if (dashboardType === 'network') {
        // get friends of logged in user
        const friends = await FriendRepo.friendList({
            searchParams: { userId: req.user.id },
            attributes: ['friendId']
        });
        friends.forEach(frnd => {
            userIds.push(frnd.friendId);
        });
    }

    const endDate = moment().format();
    let startDate = moment().startOf('day').format();

    // check for time filter
    if (req.searchQuery.withInTime) {
        switch (req.searchQuery.withInTime) {
        case 'week':
            startDate = moment().subtract(7, 'days').format();
            break;
        case 'month':
            startDate = moment().subtract(1, 'months').format();
            break;
        case 'year':
            startDate = moment().subtract(1, 'years').format();
            break;
        case 'alltime':
            startDate = moment('2015-01-01T00:00:00').format();
            break;
        }
    }

    /* params for getting dashboard user award(given/received) info */
    const userAwardParam = {
        searchParams: {
            userId: { [Op.in]: userIds },
            createdAt: {
                [Op.and]: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                }
            }
        },
        include: [{
            model: user,
            include: {
                model: file,
                as: 'profileImage'
            },
            required: true
        }],
        order: [
            ['awardCount', 'DESC']
        ],
        limit: 3
    };

    /* params for getting dashboard post activity info */
    const postParams = {
        searchParams: {
            userId: { [Op.in]: userIds },
            createdAt: {
                [Op.and]: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                }
            }
        },
        include: [{
            model: post,
            // attributes: ['title'],
            include: [
                {
                    model: post,
                    as: 'parentPost',
                    // attributes: ['title'],
                    include: [
                        {
                            model: file
                        }
                    ]
                },
                { model: file }
            ],
            required: true
        }],
        order: [
            ['count', 'DESC']
        ],
        limit: 1
    };

    try {
        // get total Awards Given by me
        const AwardsGiven = await db.sequelize.query(`SELECT sum(count) as count FROM awardMappings where presenterId=${req.user.id} and type= 'USER' and deletedAt is null`, { type: Sequelize.QueryTypes.SELECT });
        if (AwardsGiven && AwardsGiven.length && AwardsGiven[0].count) {
            dashboardData.awardsGiven = parseInt(AwardsGiven[0].count);
        }

        // get top 3 awarded users
        let topAwardedUsers = [];
        if (dashboardType === 'user') {
            const Users = await UserAwardDashboardRepo.userAwardDashboardList(userAwardParam);
            topAwardedUsers = Users.rows;
        } else if (dashboardType === 'network') {
            const Users = await UserNetworkAwardRepo.userNetworkAwardList(userAwardParam);
            topAwardedUsers = Users.rows;
        }
        // create data of top3 awarded users(for any case(user/network))
        if (topAwardedUsers.length) {
            const newTopAwardedUsers = [];
            topAwardedUsers.forEach(awardUsr => {
                const result = {};
                result['id'] = awardUsr.user.id;
                result['name'] = awardUsr.user.name;
                result['file'] = awardUsr.user.profileImage;

                // push Data
                newTopAwardedUsers.push(result);
            });

            // add 3 top awarded user to dashboardData(if*)
            dashboardData.firstMostAwardedUser = newTopAwardedUsers[0];
            if (newTopAwardedUsers[1]) {
                dashboardData.secondMostAwardedUser = newTopAwardedUsers[1];
            }
            if (newTopAwardedUsers[2]) {
                dashboardData.thirdMostAwardedUser = newTopAwardedUsers[2];
            }
        }

        // MOST COMMENTED POST
        postParams.searchParams['type'] = _appConstant.DASHBOARD_POST_COMMENTED;
        postParams.searchParams['count'] = { [Op.gt]: 0 };
        const mostCommentedPost = await PostDashboardRepo.postDashboardRecordList(postParams);
        if (mostCommentedPost.rows.length) {
            const data = mostCommentedPost.rows[0];
            const result = {};
            result['id'] = data.postId;
            if (data.post.parentPost) {
                result['title'] = data.post.parentPost.title;
                result['file'] = data.post.parentPost.file;
            } else {
                result['title'] = data.post.title;
                result['file'] = data.post.file;
            }

            // update Data
            dashboardData.mostCommentedPost = result;
        }

        // MOST REPOSTED POST
        postParams.searchParams['type'] = _appConstant.DASHBOARD_POST_REPOSTED;
        postParams.searchParams['count'] = { [Op.gt]: 0 };
        const mostRepostedPost = await PostDashboardRepo.postDashboardRecordList(postParams);
        if (mostRepostedPost.rows.length) {
            const data = mostRepostedPost.rows[0];
            const result = {};
            result['id'] = data.postId;
            if (data.post.parentPost) {
                result['title'] = data.post.parentPost.title;
                result['file'] = data.post.parentPost.file;
            } else {
                result['title'] = data.post.title;
                result['file'] = data.post.file;
            }

            // update Data
            dashboardData.mostRepostedPost = result;
        }

        // MOST FORWARDED POST
        postParams.searchParams['type'] = _appConstant.DASHBOARD_POST_FORWARDED;
        const mostForwardedPost = await PostDashboardRepo.postDashboardRecordList(postParams);
        if (mostForwardedPost.rows.length) {
            const data = mostForwardedPost.rows[0];
            const result = {};
            result['id'] = data.postId;
            if (data.post.parentPost) {
                result['title'] = data.post.parentPost.title;
                result['file'] = data.post.parentPost.file;
            } else {
                result['title'] = data.post.title;
                result['file'] = data.post.file;
            }

            // update Data
            dashboardData.mostForwardedPost = result;
        }

        // MOST BOOKMARKED POST
        postParams.searchParams['type'] = _appConstant.DASHBOARD_POST_BOOKMARKED;
        postParams.searchParams['count'] = { [Op.gt]: 0 };
        const mostBookmarkedPost = await PostDashboardRepo.postDashboardRecordList(postParams);
        if (mostBookmarkedPost.rows.length) {
            const data = mostBookmarkedPost.rows[0];
            const result = {};
            result['id'] = data.postId;
            if (data.post.parentPost) {
                result['title'] = data.post.parentPost.title;
                result['file'] = data.post.parentPost.file;
            } else {
                result['title'] = data.post.title;
                result['file'] = data.post.file;
            }

            // update Data
            dashboardData.mostBookmarkedPost = result;
        }

        // MOST AWARDED POST
        postParams.searchParams['type'] = _appConstant.DASHBOARD_POST_AWARDED;
        const mostAwardedPost = await PostDashboardRepo.postDashboardRecordList(postParams);
        if (mostAwardedPost.rows.length) {
            const data = mostAwardedPost.rows[0];
            const result = {};
            result['id'] = data.postId;
            if (data.post.parentPost) {
                result['title'] = data.post.parentPost.title;
                result['file'] = data.post.parentPost.file;
            } else {
                result['title'] = data.post.title;
                result['file'] = data.post.file;
            }

            // update Data
            dashboardData.mostAwardedPost = result;
        }

        // MOST TRENDING POST
        const trendingPost = await PostDashboardRepo.postDashboardRecordList(
            {
                attributes: ['postId', [Sequelize.fn('SUM', Sequelize.col('count')), 'sum']],
                searchParams: {
                    userId: userIds,
                    createdAt: {
                        [Op.and]: {
                            [Op.gte]: startDate,
                            [Op.lte]: endDate
                        }
                    }
                },
                include: [{
                    model: post,
                    // attributes: ['title'],
                    include: [
                        {
                            model: post,
                            as: 'parentPost',
                            // attributes: ['title'],
                            include: [
                                {
                                    model: file
                                }
                            ]
                        },
                        { model: file }
                    ],
                    required: true
                }],

                group: ['postId'],
                order: [[Sequelize.literal('sum'), 'DESC']],
                limit: 1
            });

        if (trendingPost.rows.length) {
            const data = trendingPost.rows[0];
            const result = {};
            result['id'] = data.postId;
            if (data.post.parentPost) {
                result['title'] = data.post.parentPost.title;
                result['file'] = data.post.parentPost.file;
            } else {
                result['title'] = data.post.title;
                result['file'] = data.post.file;
            }

            // update Data
            dashboardData.mostTrendingPost = result;
        }

        res.data = { dashboardData };
        return next();
    } catch (err) {
        return next(err);
    }
}
