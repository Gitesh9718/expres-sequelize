/**
 * Created by manoj on 18/9/19.
 */
const FriendRepo = require('app/Repositories/FriendRepository');
const ConnectionService = require('app/Services/ConnectionService');
const NotificationRepo = require('app/Repositories/NotificationRepository');

module.exports = {
    addFriend: addFriend
};

async function addFriend(user, userMeta, friendId, friendMetaId) {
    let friends = [
        {
            userMetaId: userMeta.id, userId: user.id,
            friendMetaId: friendMetaId, friendId: friendId
        },
        {
            userMetaId: friendMetaId, userId: friendId,
            friendMetaId: userMeta.id, friendId: user.id
        },
    ];

    let friendObj = await FriendRepo.friendBulkCreate(friends);

    await NotificationRepo.notificationCreate({
        type: _appConstant.NOTIFICATION_TYPE_INVITATION_ACCEPT, actionOwnerId: user.id,
        userId: friendId, text: user.name + ' is now a connection in your trusted network.'
    });

    console.log("### CREATING CONNECTIONS FOR userId %s with inviterId %s FROM REGISTERATION", user.id, friendId);
    // mapping connections
    ConnectionService.createConnections(friendId, user.id);

    return new Promise(resolve => resolve(friendObj));
}
