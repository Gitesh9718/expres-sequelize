'use strict';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');
const AnalyticsRepo = require('app/Repositories/AnalyticsRepository');
const UserRepo = require('app/Repositories/UserRepository');
const PostRepo = require('app/Repositories/PostRepository');
const CommentRepo = require('app/Repositories/CommentRepository');
const ConversationRepo = require('app/Repositories/ConversationRepository');

module.exports = {
    calculateAnalytics: calculateAnalytics
};

async function calculateAnalytics() {
    let data = {
        date: moment().format('YYYY-MM-DD'),

        users: 0,
        newUsers: 0,
        activeUsers: 0,

        totalPosts: 0,
        posts: 0,
        requestPosts: 0,

        postForwards: 0,
        comments: 0,

        bilateralChats: 0,
        groups: 0,
        introduceGroups: 0,

        sessionTimeSpent: 0,
    };

    let analytics = await AnalyticsRepo.analyticDetail({searchParams: {date: data.date}});

    // createdAt: {[Op.gte]: data.date}
    data.users = await UserRepo.userCount({});
    data.newUsers = await UserRepo.userCount(Sequelize.where(Sequelize.fn('date', Sequelize.col('createdAt')), '=', data.date));
    data.activeUsers = await UserRepo.userCount({});

    data.totalPosts = await PostRepo.postCount({});
    data.posts = await PostRepo.postCount({type: _appConstant.POST_TYPE_POST});
    data.requestPosts = await PostRepo.postCount({type: _appConstant.POST_TYPE_REQUEST});

    data.postForwards = await PostRepo.postCount({parentId: {[Op.ne]: null}});

    data.comments = await CommentRepo.commentCount({});

    data.bilateralChats = await ConversationRepo.conversationCount({type: _appConstant.CHAT_TYPE_SINGLE});
    data.groups = await ConversationRepo.conversationCount({type: _appConstant.CHAT_TYPE_GROUP, groupType: {[Op.eq]: null}});
    data.introduceGroups = await ConversationRepo.conversationCount({type: _appConstant.CHAT_TYPE_GROUP, groupType: {[Op.ne]: null}});

    if (analytics) {
        return await AnalyticsRepo.analyticUpdate({id: analytics.id}, data);
    }

    return await AnalyticsRepo.analyticCreate(data);
}


