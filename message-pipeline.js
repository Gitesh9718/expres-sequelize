const PubNub = require('pubnub');
const CONFIG = require('config/config');
const pubnub = new PubNub({
    publishKey: CONFIG.PUBNUB.PUBLISH_KEY,
    subscribeKey: CONFIG.PUBNUB.SUBSCRIBE_KEY
});

function publishMessage (channel, message) {
    const publishConfig = {
        channel: channel,
        message
    };
    pubnub.publish(publishConfig, function (status, response) {
        // console.error(status, '----> Pubnub message --->', channel);
    });
}

function isUserOnlineOnChat (userIds = [], conversationId = '') {
    const channels = [];
    for (let i = 0; i < userIds.length; i++) {
        channels.push('user_on_chat_screen_' + userIds[i] + '_' + conversationId);
    }
    let found = false;

    return new Promise((resolve, reject) => {
        pubnub.hereNow(
            {
                channels: channels,
                includeUUIDs: true,
                includeState: true
            },
            function (status, response) {
                // handle status, response
                console.log('====================================');
                console.log(status);
                console.log('====================================');
                console.log(response);
                if (response && response.channels) {
                    for (let i = 0; i < userIds.length; i++) {
                        const channel = 'user_on_chat_screen_' + userIds[i] + '_' + conversationId;
                        if (response.channels[channel] && response.channels[channel].occupants) {
                            response.channels[channel].occupants.forEach((occupant) => {
                                console.log(occupant, userIds[i], 'checkong');
                                if (occupant.uuid === ('user_' + userIds[i])) {
                                    found = true;
                                }
                            });
                        }
                    }
                }
                console.log('returning');
                return resolve(found);
            }
        );
    });
}
// pubnub.addListener({
//     status: function(statusEvent) {
//         if (statusEvent.category === "PNConnectedCategory") {
//             publishSampleMessage();
//         }
//     },
//     message: function(msg) {
//         console.log(msg.message.title);
//         console.log(msg.message.description);
//     },
//     presence: function(presenceEvent) {
//         // handle presence
//     }
// });
// console.log("Subscribing..");
// pubnub.subscribe({
//     channels: ['hello_world']
// });
module.exports = {
    publishMessage,
    isUserOnlineOnChat
};
