/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const FeedbackRepo = require('app/Repositories/FeedbackRepository');
const FileRepo = require('app/Repositories/FileRepository');

const NotificationService = require('app/Services/NotificationService');

module.exports.store = async function (req, res, next) {
    let body = req.body;

    if (!body.text) {
        return next({message: _errConstant.REQUIRED_TEXT, status: 400});
    }

    body['userId'] = req.user.id;

    try {
        await FeedbackRepo.feedbackCreate(body);
        let attachments = [];
        if (body.fileId) {
            let file = await FileRepo.fileDetail({searchParams: {id: body.fileId}});
            file = file.toJSON();
            attachments.push({
                name: file.name, path: file.url
            });
        }
        let subject = '';
        switch (body.type) {
            case 'Feedback':
                subject = 'Feedback';
                break;
            case 'BUG':
                subject = 'Bug Report';
                break;
            default:
                subject = 'Bug Report';
        }
        NotificationService.sendMail(_appConstant.ADMIN_EMAILS, subject, body.text, attachments);
        // NotificationService.sendMail(['manojrawat1502@gmail.com', 'naren1449@gmail.com'], subject, body.text, attachments);
        next();
    } catch (err) {
        next(err);
    }
};
