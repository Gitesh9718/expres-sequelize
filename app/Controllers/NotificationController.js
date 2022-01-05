const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { user, file, post } = require('models');

const NotificationRepo = require('app/Repositories/NotificationRepository');
const UserRepo = require('app/Repositories/UserRepository');

module.exports = {
    getAll: getAll,
    detail: detail
};

async function getAll (req, res, next) {
    const notificationParams = {
        searchParams: { userId: req.user.id },
        include: [
            {
                model: post,
                include: [{
                    model: user,
                    attributes: ['id', 'name', 'image'],
                    include: [{ model: file, as: 'profileImage' }]
                }, { model: post, as: 'parentPost' }]
            },
            { model: user, attributes: ['id', 'name', 'image'], include: [{ model: file, as: 'profileImage' }] },
            {
                model: user,
                as: 'actionOwner',
                attributes: ['id', 'name', 'image'],
                include: [{ model: file, as: 'profileImage' }]
            }
        ],
        order: [
            ['createdAt', 'desc']
        ],
        limit: req.limit,
        offset: req.skip
    };

    try {
        const notifications = await NotificationRepo.notificationList(notificationParams);

        // Resetting unReadNotificationCount
        UserRepo.userUpdate({ id: req.user.id }, { unReadNotificationCount: 0 });

        res.data = { items: notifications.rows, paginate: { total: notifications.count } };

        next();
    } catch (err) {
        next(err);
    }
}

async function detail (req, res, next) {
    const notificationParams = {
        searchParams: { id: req.params.id },
        include: [
            {
                model: post,
                include: [{
                    model: user,
                    attributes: ['id', 'name', 'image'],
                    include: [{ model: file, as: 'profileImage' }]
                }, { model: post, as: 'parentPost' }]
            },
            { model: user, include: [{ model: file, as: 'profileImage' }] },
            { model: user, as: 'actionOwner', include: [{ model: file, as: 'profileImage' }] }
        ]
    };

    try {
        let notification = await NotificationRepo.notificationDetail(notificationParams);
        notification = notification.toJSON();

        if (notification.type === _appConstant.NOTIFICATION_TYPE_INVITATION) {
            notification.user = notification.actionOwner;
        }

        res.data = notification;
        next();
    } catch (err) {
        next(err);
    }
}
