// const ReportPostRepo = require('app/Repositories/ReportPostRepository');
// const ReportUserRepo = require('app/Repositories/ReportUserRepository');
const ReportRepo = require('app/Repositories/ReportRepository');
const UserRepo = require('app/Repositories/UserRepository');

const NotificationService = require('app/Services/NotificationService');

module.exports = {
    report: report,
    reportPost: reportPost,
    reportUser: reportUser,
};

async function report(req, res, next) {
    let body = req.body;
    body['userId'] = req.user.id;

    if (!body.typeId) {
        return next({message: _errConstant.REQUIRED_TYPE_ID, status: 400});
    }

    if (['POST', 'GROUP', 'USER'].indexOf(body.type) === -1) {
        return next({message: _errConstant.INVALID_TYPE, status: 400});
    }

    try {
        await createAndSendMail(req.user, body);
        next();
    } catch (err) {
        next(err);
    }
}

async function createAndSendMail(user, body) {
    await ReportRepo.reportCreate(body);

    let message = "Report by:<br> name: " + user.name + "<br> id: " + user.id + "<br> <br> Reported " + body.type + " id: " + body['typeId'] + "<br> Concern To:" + body['concernTo'];

    message += "<br><br>" + body.text;
    
    /* change POST to PUBLICATION */
    if(body.type === 'POST'){
        body.type = 'Publication'
    }

    NotificationService.sendMail(_appConstant.ADMIN_EMAILS, body.type + ' Report', message);
    // NotificationService.sendMail(['manojrawat1502@gmail.com', 'naren1449@gmail.com'], 'User Report', message);

    return new Promise(resolve => resolve({}));
}

async function reportPost(req, res, next) {
    let body = req.body;
    body['userId'] = req.user.id;
    //type will be POST
    body['type'] = "POST";
    //typeId refers to Post Id
    body['typeId'] = req.params.id;

    try {
        await createAndSendMail(req.user, body);

        /*await ReportRepo.reportCreate(body);

        let message = "Report by:<br> name: " + req.user.name + "<br> id: " + req.user.id + "<br> <br> Reported Post id: " + body['typeId'];

        message += "<br><br>" + body.text;

        NotificationService.sendMail(_appConstant.ADMIN_EMAILS, 'Post Report', message);*/

        next();
    } catch (err) {
        next(err);
    }
}

async function reportUser(req, res, next) {
    let body = req.body;
    body['userId'] = req.user.id;
    //type will be USER
    body['type'] = "USER"
    //typeId refers to User Id
    body['typeId'] = req.params.id;

    try {
        await createAndSendMail(req.user, body);

        /*let reportedUser = await UserRepo.userDetail({searchParams: {id: body['typeId']}});

        await ReportRepo.reportCreate(body);

        let message = "Report by:<br> name: " + req.user.name + "<br> id: " + req.user.id + "<br> <br> Reported User: <br> name: " + reportedUser.name + "<br> id: " + reportedUser.id;

        message += "<br><br>" + body.text;

        NotificationService.sendMail(_appConstant.ADMIN_EMAILS, 'User Report', message);*/
        // NotificationService.sendMail(['manojrawat1502@gmail.com', 'naren1449@gmail.com'], 'User Report', message);

        next();
    } catch (err) {
        next(err);
    }
}
