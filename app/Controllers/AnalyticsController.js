/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const AnalyticsRepo = require('app/Repositories/AnalyticsRepository');
const moment = require('moment');

module.exports = {
    getAnalytics: getAnalytics
};

async function getAnalytics(req, res, next) {
    /*let body = {
        userId: req.user.id,
        postId: req.params.id
    };*/

    try {
        let data = {
            date: moment().format('YYYY-MM-DD'),
            users: 0,
            newUsers: 0,
            posts: 0,
            postForwards: 0,
            comments: 0,
            bilateralChats: 0,
            groups: 0,
            sessionTimeSpent: 0,
        };

        let analytics = await AnalyticsRepo.analyticDetail({searchParams: {date: moment().format('YYYY-MM-DD')}});

        if (analytics) {
            data = analytics.toJSON()
        }

        res.data = {data};

        next();
    } catch (err) {
        next(err);
    }
}
