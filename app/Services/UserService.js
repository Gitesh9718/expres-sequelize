/**
 * Created by manoj on 18/9/19.
 */
'use strict';

const UserRepo = require('app/Repositories/UserRepository');
const ImageService = require('app/Services/ImageService');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const UserEmailRepo = require('app/Repositories/UserEmailRepository');
const _ = require('lodash');

module.exports = {
    userImageCompressAndUpdate: userImageCompressAndUpdate,
    userUnreadNotificationCountInc: userUnreadNotificationCountInc,
    updateUserOtherEmails: updateUserOtherEmails
};

async function userImageCompressAndUpdate (userId, base64) {
    base64 = await ImageService.resizeBase64AccordingToHeight(base64, 1024);

    return UserRepo.userUpdate({ id: userId }, { image: base64.toString('base64') });
}

async function userUnreadNotificationCountInc (notifiedUserId) {
    // update the count in user table
    await UserRepo.userUpdate({ id: notifiedUserId }, { unReadNotificationCount: Sequelize.literal('unReadNotificationCount + 1') });
}

async function updateUserOtherEmails (userId, otherEmails) {
    // emailParams to get list of email(using where In)
    const emailParams = {
        where: {
            userId: userId,
            email: otherEmails
        },
        paranoid: false
    };

    let emailsList;

    emailsList = await UserRepo.userDetail({ searchParams: { id: { [Op.ne]: userId }, email: otherEmails } });

    if (emailsList) {
        throw { message: 'Email already exist', status: 400 };
    } else {
        emailsList = await UserEmailRepo.userEmailDetail({ searchParams: { userId: { [Op.ne]: userId }, email: otherEmails } });
        if (emailsList) {
            throw { message: 'Email already exist', status: 400 };
        } else {
            let existingEmails = [];
            let restoreIds = [];
            // list of email got from userEmail table based on search param
            emailsList = await UserEmailRepo.userEmailList(emailParams);

            // create an array of existing emails
            if (emailsList) {
                // existing email array
                existingEmails = emailsList.map(item => { return item.email; });
                // emails to restore
                restoreIds = emailsList.filter(item => { return item.deletedAt !== null; }).map(item => { return item.id; });
            }

            emailsList = await UserRepo.userDetail({ searchParams: { id: userId, email: otherEmails } });
            if (emailsList) {
                existingEmails.push(emailsList.email);
            }

            // create final data array to insert (will consist objects with userId & email key)
            const data = [];

            // loop through each email in email array
            for (const email of otherEmails) {
                // check if perticular email exist in existingEmails Array(result from userEmail table)
                if (existingEmails.includes(email)) {
                    continue;
                }
                // create an object that will consist userId & email key
                const dataObj = {};
                dataObj['userId'] = userId;
                dataObj['email'] = email;
                // push the object in data array
                data.push(dataObj);
            } // for loop

            // delete all email records not present in otherEmails
            // await UserEmailRepo.userEmailDelete({userId: userId, email: {[Op.notIn]: otherEmails}});

            // restore emails if any
            if (restoreIds.length > 0) {
                await UserEmailRepo.userEmailRestore({ id: restoreIds });
            }

            // finally add new emails in userEmail model
            await UserEmailRepo.userEmailBulkCreate(data);
        }
    }
}// end of function
