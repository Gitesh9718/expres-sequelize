'use strict';

const nodemailer = require('nodemailer');
const request = require('request');
const async = require('async');

// const fcmApiKey = "AAAA0GD-Bhs:APA91bEk4txo61iarJxLZhSdahPjEp6dL0ivobClPPvoW5drfmvRRPHbUad0aae9JADRjX_Cg_MQwFxm4BKhQPkrWPtOj4L6z5pimBc3O25GI1sFriwUZj85SJ1dA8raK45IzHgWO7K5";
const fcmApiKey = 'AAAAJ-j9ZDI:APA91bF4H-prmTfYagVl045WabC-4XF9k6AmQKLEdhsfAji1rgkjDg2Pss2kh2VIsSdEXkXjWlqC5n7NdFALoPqh9bWJhKbpPgsJ0Mps3zdHAUH3zKmDVQWnQKcI4H_S0Wduxr5VnbWn';

module.exports = {
    sendMail: mail,
    sendNotification: sendNotification,
    sendNotificationIos: sendNotificationIos,
    sendNotificationAndroid: sendNotificationAndroid,
    sendMessage: sendMessage
};

function mail (emails, subject, htmlText, attachments) {
    // use config for mail credentials
    const transporter = nodemailer.createTransport(_config.mail);

    if (!attachments) {
        attachments = [];
    }

    const mailOptions = {
        from: _config.mail_from,
        to: emails.email ? emails.email : emails,
        subject: subject,
        html: htmlText,
        attachments: attachments
    };

    return new Promise((resolve, reject) => {
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return reject(error);
            }
            console.log('Message sent to %s with id %s', mailOptions.to, info.messageId);
            return resolve(info);
        });
    });
}

function sendNotificationAndroid (notification, userDevice) {
    return sendNotification(notification, userDevice, false);
}

function sendNotificationIos (notification, userDevice) {
    return sendNotification(notification, userDevice, true);
}

function sendNotification (notification, userDevices, isIos) {
    const sender = {
        name: 'Meoh Test',
        fcmApiKey: fcmApiKey
    };

    if (notification['text']) {
        notification['text'] = notification['text'].substr(0, 400) + (notification['text'].length > 400 ? '...' : '');
    }
    if (!notification.title) {
        notification.title = notification.text.substring(0, 200);
    }

    const url = 'https://fcm.googleapis.com/fcm/send';
    const fcmData = {
        /* notification: {
            title: notification.title,
            body: notification.text,
        }, */
        data: {
            data: notification
        },
        android: {
            priority: 'high'
        },
        apns: {
            headers: {
                'apns-priority': '10'
            },
            payload: {
                aps: {
                    'content-available': 1
                }
            }
        },
        registration_ids: userDevices
    };

    if (isIos) {
        fcmData['notification'] = {
            title: notification.title,
            body: notification.text
        };
    }

    return new Promise((resolve, reject) => {
        request({
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'key=' + sender.fcmApiKey
            },
            url: url,
            method: 'POST',
            json: fcmData
        }, (error, response, body) => {
            if (error) {
                return reject(error);
            }
            try {
                return resolve(JSON.parse(body));
            } catch (e) {
                return resolve(body);
            }
        });
    });
}

function sendMessage () {
    const AWS = require('aws-sdk');

    AWS.config = new AWS.Config();
    AWS.config.update({
        /* accessKeyId: "AKIAYVUKDMM2SH7V5ALT",
        secretAccessKey: "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",
        region: "eu-central-1" */
        accessKeyId: 'AKIAY7EKMZHTDDQNDFXM',
        secretAccessKey: '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',
        region: 'ap-south-1'
    });

    const params = {
        Message: 'OTP message',
        Subject: 'OTP',
        PhoneNumber: '+918851475304'
    };
    // Create promise and SNS service object
    const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();

    // Handle promise's fulfilled/rejected states
    publishTextPromise.then(
        (data) => {
            console.log(`Message ${params.Message} send sent to the topic`);
            console.log('MessageID is ' + data.MessageId);
        }).catch(
        (err) => {
            console.error(err, err.stack);
        });

    /* const destinationNumber = "+919718510439";

    const message = "This message was sent through Amazon Pinpoint ";

    const applicationId = "d0c4f148f0c04fe9b1c52e776cc29e2a";

    const messageType = "TRANSACTIONAL";

    // AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
    //
    // AWS.config.update({region:aws_region});

    const pinpoint = new AWS.Pinpoint();

    const params = {
        ApplicationId: applicationId,
        MessageRequest: {
            Addresses: {
                [destinationNumber]: {
                    ChannelType: 'SMS'
                }
            },
            MessageConfiguration: {
                SMSMessage: {
                    Body: message,
                    // Keyword: registeredKeyword,
                    MessageType: messageType,
                    // OriginationNumber: originationNumber,
                    // SenderId: senderId,
                }
            }
        }
    };

    return new Promise((resolve, reject) => {
        pinpoint.sendMessages(params, function(err, data) {
            // If something goes wrong, print an error message.
            if(err) {
                console.log(err.message);
                // Otherwise, show the unique ID for the message.
            } else {
                console.log("Message sent! "
                    + data['MessageResponse']['Result'][destinationNumber]['StatusMessage']);
            }
        });
    }); */
}
