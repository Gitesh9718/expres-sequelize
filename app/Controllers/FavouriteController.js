/**
 * Created by manoj on 30/5/19.
 */

/* global _appConstant, _errConstant */
'use strict';
const Sequelize = require('sequelize');
// const Op = Sequelize.Op;

const FavouriteRepo = require('app/Repositories/FavouriteRepository');
const PostRepo = require('app/Repositories/PostRepository');
const UserDashboardService = require('app/Services/UserDashboardService');
const NotificationRepo = require('app/Repositories/NotificationRepository');

module.exports = {
    store: store
};

async function store (req, res, next) {
    const body = {
        userId: req.user.id,
        postId: req.params.id
    };

    // for user dashboard(post)
    const eventData = {
        type: _appConstant.DASHBOARD_POST_BOOKMARKED
    };

    try {
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.id } });
        if (!originalPost) {
            return next({ message: _errConstant.NO_PUBLICATION, status: 400 });
        }

        // update eventData
        eventData['postId'] = originalPost.id;
        eventData['userId'] = originalPost.userId;

        const favPost = await FavouriteRepo.favouriteDetail({ searchParams: body, paranoid: false });

        /* if already favourite */
        if (favPost && !favPost.deletedAt) {
            const favPostCreateAt = new Date(favPost.createdAt);
            const currentDate = new Date();
            await FavouriteRepo.favouriteDelete({ id: favPost.id });
            // decrement bookmarkedCount for post
            await PostRepo.postUpdate({ id: req.params.id }, {
                bookmarkedCount: Sequelize.literal('bookmarkedCount - 1')
            });
            // update dashboard for decrementing bookmarks (only if created today)
            if (favPostCreateAt.toDateString() === currentDate.toDateString()) {
                UserDashboardService.DailyPostDashboardDataDecrement(eventData);
            }
        }
        /* if favourite is deleted */
        else if (favPost && favPost.deletedAt) {
            await FavouriteRepo.favouriteUpdate({ searchParams: { id: favPost.id }, paranoid: false },
                { deletedAt: null, createdAt: new Date() });
            // increment bookmarkedCount for post
            await PostRepo.postUpdate({ id: req.params.id }, {
                bookmarkedCount: Sequelize.literal('bookmarkedCount + 1')
            });

            // send notification to originalPost creator if not bookmarked by himself
            if (req.user.id !== originalPost.userId) {
                await NotificationRepo.notificationCreate({
                    type: _appConstant.NOTIFICATION_TYPE_BOOKMARK,
                    postId: originalPost.id,
                    actionOwnerId: req.user.id,
                    userId: originalPost.userId,
                    text: 'Your post has been bookmarked by ' + req.user.name
                });
            }

            // update dashboard for incrementing bookmarks
            UserDashboardService.DailyPostDashboardDataCreateORIncrement(eventData);
        } else {
            await FavouriteRepo.favouriteCreate(body);
            // increment bookmarkedCount for post
            await PostRepo.postUpdate({ id: req.params.id }, {
                bookmarkedCount: Sequelize.literal('bookmarkedCount + 1')
            });

            // send notification to originalPost creator if not bookmarked by himself
            if (req.user.id !== originalPost.userId) {
                await NotificationRepo.notificationCreate({
                    type: _appConstant.NOTIFICATION_TYPE_BOOKMARK,
                    postId: originalPost.id,
                    actionOwnerId: req.user.id,
                    userId: originalPost.userId,
                    text: 'Your post has been bookmarked by ' + req.user.name
                });
            }

            // update dashboard for incrementing bookmarks
            UserDashboardService.DailyPostDashboardDataCreateORIncrement(eventData);
        }

        next();
    } catch (err) {
        next(err);
    }
}
