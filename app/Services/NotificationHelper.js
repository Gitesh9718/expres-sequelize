/* global _appConstant */
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

const { user, file } = require('models');

const UserDeviceRepo = require('app/Repositories/UserDeviceRepository');
const NotificationService = require('app/Services/NotificationService');

module.exports = {
    sendNotification: sendNotification,
    sendNotificationById: sendNotificationById,
    sendDailyNotifications: sendDailyNotifications
};

async function sendNotification (userId, notify) {
    const userDevices = await UserDeviceRepo.userDeviceList({ searchParams: { userId: userId } });
    const androidDeviceTokens = [];
    const iosDeviceTokens = [];

    userDevices.forEach(userDevice => {
        if (userDevice.token && userDevice.type === _appConstant.DEVICE_TYPE_IOS) {
            iosDeviceTokens.push(userDevice.token);
        } else if (userDevice.token && userDevice.type === _appConstant.DEVICE_TYPE_ANDROID) {
            androidDeviceTokens.push(userDevice.token);
        }
    });
    // delete notify['conversationUser'];
    delete notify['deletedAt'];
    delete notify['updatedAt'];
    delete notify['createdAt'];

    if (iosDeviceTokens.length) {
        NotificationService.sendNotificationIos(notify, iosDeviceTokens).then(response => {
            parseNotificationResponse(response, iosDeviceTokens, userId);
        }).catch();
    }
    if (androidDeviceTokens.length) {
        NotificationService.sendNotificationAndroid(notify, androidDeviceTokens).then(response => {
            parseNotificationResponse(response, androidDeviceTokens, userId);
        }).catch();
    }
    if (!(androidDeviceTokens.length || iosDeviceTokens.length)) {
        console.log('no device for user', userId);
    }
}

async function sendNotificationById (notificationId) {
    const NotificationRepo = require('app/Repositories/NotificationRepository');
    const NotificationService = require('app/Services/NotificationService');

    let notification = await NotificationRepo.notificationDetail({
        searchParams: { id: notificationId },
        include: [
            {
                model: user,
                as: 'actionOwner',
                attributes: ['id', 'name', 'city', 'company', 'position', 'totalAwards'],
                include: [{ model: file, as: 'profileImage' }]
            }
        ]
    });

    if (notification) {
        notification = notification.toJSON();
        switch (notification.type) {
        case 'COMMENT':
            notification.title = notification.actionOwner.name + ' contributed on your publication';
            break;
            // case 'COMMENT_REPLY':
            // case 'FORWARD':
            // case 'INVITATION':
        }
        // delete notification['actionOwner'];
        const userDevices = await UserDeviceRepo.userDeviceList({ searchParams: { userId: notification.userId } });
        const deviceTokens = [];
        const androidDeviceTokens = [];
        const iosDeviceTokens = [];

        userDevices.forEach(userDevice => {
            if (userDevice.token) {
                deviceTokens.push(userDevice.token);
            }

            if (userDevice.token && userDevice.type === _appConstant.DEVICE_TYPE_IOS) {
                iosDeviceTokens.push(userDevice.token);
            } else if (userDevice.token && userDevice.type === _appConstant.DEVICE_TYPE_ANDROID) {
                androidDeviceTokens.push(userDevice.token);
            }
        });

        delete notification['createdAt'];
        delete notification['deletedAt'];
        delete notification['updatedAt'];
        delete notification['isRead'];

        /* if (deviceTokens.length) {
            NotificationService.sendNotification(notification, deviceTokens).then().catch();
        } */

        if (iosDeviceTokens.length) {
            NotificationService.sendNotificationIos(notification, iosDeviceTokens).then(response => {
                parseNotificationResponse(response, iosDeviceTokens, notification.userId);
            }).catch();
        }
        if (androidDeviceTokens.length) {
            NotificationService.sendNotificationAndroid(notification, androidDeviceTokens).then(response => {
                parseNotificationResponse(response, androidDeviceTokens, notification.userId);
            }).catch();
        }
        if (!(androidDeviceTokens.length || iosDeviceTokens.length)) {
            console.log('no device for user', notification.userId);
        }
    }
}

async function parseNotificationResponse (response, deviceTokens, userId) {
    console.log('notification done for user ', userId, response);

    if (response && response.hasOwnProperty('results')) {
        const deletedDevices = [];
        response.results.forEach((result, index) => {
            if (result.hasOwnProperty('error')) {
                deletedDevices.push(deviceTokens[index]);
            }
        });

        if (deletedDevices.length) {
            await UserDeviceRepo.userDeviceDelete({ token: { [Op.in]: deletedDevices }, userId: userId });
        }

        console.log('total device for user ', userId, ' is ', deviceTokens.length, 'deleted devices', deletedDevices.length);
        // console.log(deviceTokens, 'deleted devices', deletedDevices);
    }
}

// send daily notifications
async function sendDailyNotifications () {
    const NotificationRepo = require('app/Repositories/NotificationRepository');
    const FriendRepo = require('app/Repositories/FriendRepository');
    const notifiedUserIds = [];

    // time range for friend's post
    const endTime = moment();
    const startTime = moment(endTime).subtract(1, 'd');

    const notificationParam = {
        searchParams: { isSend: false, type: _appConstant.DAILY_NOTIFICATIONS_TYPES },
        attributes: ['userId', [Sequelize.fn('COUNT', Sequelize.col('userId')), 'count']],
        group: ['userId']
        /* attributes: ['type', 'userId', [Sequelize.fn('COUNT', Sequelize.col('type')), 'count']],
        group: ['type', 'userId'],
        isRaw: true */
    };

    const notifications = await NotificationRepo.notificationList(notificationParam);
    // user ids got from notification repo
    const userIdsFromNotf = [];

    if (notifications && notifications.length) {
        notifications.forEach(notf => {
            notifiedUserIds.push(notf.userId);
            userIdsFromNotf.push(notf.userId);
        });
    }
    console.log('from notf ', userIdsFromNotf);
    // get user's list (to be notified) if there network had some recent posts
    const friendData = await FriendRepo.friendList({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('userId')), 'userId']],
        searchParams: {
            [Op.and]: [
                { postCount: { [Op.gt]: 0 } },
                { lastPostAt: { [Op.between]: [startTime, endTime] } }
            ]
        }
    });

    if (friendData && friendData.length) {
        friendData.forEach(row => {
            if (notifiedUserIds.indexOf(row.userId) === -1) {
                notifiedUserIds.push(row.userId);
            }
        });
    };

    console.log('+++ final notf users ++=> ', notifiedUserIds);

    /* const newNotifications = {};

     notifications.forEach(item => {
        let type = '';
        switch (item.type) {
        case 'FEATURE':
            type = 'feature';
            break;
        case 'COMMENT':
            type = 'comment';
            break;
        case 'COMMENT_REPLY':
            type = 'comment reply';
            break;
        case 'FORWARD':
            type = 'forward';
            break;
        case 'BOOKMARK':
            type = 'bookmark';
            break;
        case 'AWARD_USER':
            type = 'user award';
            break;
        case 'AWARD_POST':
            type = 'post award';
            break;
        case 'AWARD_COMMENT':
            type = 'comment award';
            break;
        }
        let text = '';
        if (!Object.prototype.hasOwnProperty.call(newNotifications, item.userId)) {
            text += `${item.count} ${type} `;
            newNotifications[item.userId] = text;
        } else {
            newNotifications[item.userId] += `${item.count} ${type} `;
        }
    }); */

    // console.log('daily notification ===> ', notifications);

    // send notification for each user
    notifiedUserIds.forEach(id => {
        // notf = notf.toJSON();
        const notify = { type: 'FEATURE', text: _appConstant.DAILY_NOTIFICATIONS_TEXT };
        sendNotification(parseInt(id), notify).then(() => {
            // update notifications isSend, set to true for user got from notifications table only
            if (userIdsFromNotf.indexOf(id) !== -1) {
                NotificationRepo.notificationUpdate({ userId: parseInt(id), isSend: false }, { isSend: true });
            }
        });
    });
}
