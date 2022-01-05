'use strict';

const cron = require('node-cron');
const AnalyticService = require('app/Services/AnalyticsService');
const NotificationHelper = require('app/Services/NotificationHelper');

module.exports = {
    run: runCommands
};

function runCommands () {
    // every 6 Hour
    cron.schedule('0 */6 * * *', function () {
        AnalyticService.calculateAnalytics();
    });

    // daily notifications (every morning 8 A.M (C.E.T. time) = 6 (U.T.C. time ))
    cron.schedule('0 6 * * *', function () {
        NotificationHelper.sendDailyNotifications();
    });
}
