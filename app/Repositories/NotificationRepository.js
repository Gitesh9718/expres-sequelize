/**
 * Created by manoj on 30/5/19.
 */

/* global _appConstant */

'use strict';

const { notification } = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');
const NotificationHelper = require('app/Services/NotificationHelper');
const UserService = require('app/Services/UserService');

module.exports = {
    notificationCreate: notificationCreate,
    notificationList: notificationList,
    notificationDetail: notificationDetail,
    notificationUpdate: notificationUpdate,
    notificationDelete: notificationDelete
};

async function notificationCreate (data) {
    /* if (data.text) {
        data.text = data.text.substr(0, 400) + (data.text.length > 400 ? '...' : '');
    } */
    const notify = await BaseRepo.baseCreate(notification, data);

    // incrementing unread Notification count in user table for this particular user
    await UserService.userUnreadNotificationCountInc(notify.userId);

    // no need to wait for notification (send only if not a daily notification)
    if (!_appConstant.DAILY_NOTIFICATIONS_TYPES.includes(data.type)) {
        NotificationHelper.sendNotificationById(notify.id).then(() => {
            // update notifications isSend, set to true
            notificationUpdate({ id: notify.id }, { isSend: true });
        });
    }

    return new Promise(resolve => resolve({}));
}

async function notificationDetail (params) {
    return BaseRepo.baseDetail(notification, params);
}

async function notificationUpdate (searchParams, data) {
    return BaseRepo.baseUpdate(notification, searchParams, data);
}

async function notificationList (params) {
    return BaseRepo.baseList(notification, params);
}

async function notificationDelete (searchParams) {
    return BaseRepo.baseDelete(notification, searchParams);
}
