const PubNub = require('pubnub');
const CONFIG = require('./config/config');
pubnub = new PubNub({
    publishKey: CONFIG.PUBNUB.PUBLISH_KEY,
    subscribeKey: CONFIG.PUBNUB.SUBSCRIBE_KEY
});
const conversationId = 1;
const userId = 28;
const userIds = [30, 28];
const channels = [];
for (let i = 0; i < userIds.length; i++) {
    channels.push("user_on_chat_screen_" + userIds[i] + "_" + conversationId);
}
console.log('2');
pubnub.hereNow(
    {
        channels: channels,
        includeUUIDs: true,
        includeState: true
    },
    function (status, response) {
        // handle status, response

        console.log(response.channels['user_on_chat_screen_28_1'], '--------');
        // console.log(JSON.stringify(response.channels), status);
    }
);
