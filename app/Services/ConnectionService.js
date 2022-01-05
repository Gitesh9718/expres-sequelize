'use strict';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const UserModel = require('models')['user'];

const ConnectionRepo = require('app/Repositories/ConnectionRepository');
const FriendRepo = require('app/Repositories/FriendRepository');
const UserRepo = require('app/Repositories/UserRepository');

module.exports = {
    createConnections: createConnections,
    removeConnections: removeConnections,
    migrateConnection: migrateConnection,
};

async function removeConnections(friendObj) {
    let userId = friendObj.userId;
    let friendId = friendObj.friendId;
    console.log(`### IN REMOVE CONNECTION WITH USERID ${userId} AND FRIENDID ${friendId}`);

    const user = await UserRepo.userDetail({searchParams: {id: userId}});
    const friend = await UserRepo.userDetail({searchParams: {id: friendId}});

    let connectionIds = [];

    for (const con of [{user: user, friend: friend}, {user: friend, friend: user}]) {
        let firstDegreeFriendIds = await getFriends(con.user, {
            userId: con.user.id,
            friendId: con.friend.id,
        }, 1, [], false);

        let connections = await ConnectionRepo.connectionList({
            where: {
                friendId: {[Op.in]: firstDegreeFriendIds},
                userId: con.user.id,
                degree: 1
            }
        });

        connections.forEach(connection => {
            connectionIds.push(connection.id);
        });

        let secondDegreeFriendIds = await getFriends(user, {
            userId: {[Op.in]: firstDegreeFriendIds},
            friendId: {[Op.notIn]: Array.prototype.concat([con.user.id], firstDegreeFriendIds)}
        }, 2, []);
        connections = [];
        connections = await ConnectionRepo.connectionList({
            where: {
                friendId: {[Op.in]: secondDegreeFriendIds},
                userId: con.user.id,
                degree: 2
            }
        });

        connections.forEach(connection => {
            connectionIds.push(connection.id);
        });

        let thirdDegreeFriendIds = await getFriends(user, {
            userId: {[Op.in]: secondDegreeFriendIds},
            friendId: {[Op.notIn]: Array.prototype.concat([con.user.id], secondDegreeFriendIds)}
        }, 3, connections);

        connections = [];
        connections = await ConnectionRepo.connectionList({
            where: {
                friendId: {[Op.in]: thirdDegreeFriendIds},
                userId: con.user.id,
                degree: 3
            }
        });

        connections.forEach(connection => {
            connectionIds.push(connection.id);
        });
    }
    console.log('removed connection ids', connectionIds);
    await ConnectionRepo.connectionDelete({id: {[Op.in]: connectionIds}});
}

async function createConnections(userId, friendId) {
    const user = await UserRepo.userDetail({searchParams: {id: userId}});
    const friend = await UserRepo.userDetail({searchParams: {id: friendId}});

    let connections = [];

    for (const con of [{user: user, friend: friend}, {user: friend, friend: user}]) {

        let firstDegreeFriendIds = await getFriends(con.user, {
            userId: con.user.id,
            friendId: con.friend.id
        }, 1, connections);

        console.log(`#### FIRST DEGREE FRIEND OF USERID ${con.user.id} ::: `, firstDegreeFriendIds);

        let secondDegreeFriendIds = await getFriends(user, {
            userId: {[Op.in]: firstDegreeFriendIds},
            friendId: {[Op.notIn]: Array.prototype.concat([con.user.id], firstDegreeFriendIds)}
        }, 2, connections);

        console.log(`#### SECOND DEGREE FRIEND IDS ::: `, secondDegreeFriendIds);

       let thirdDegreeFriendIds = await getFriends(user, {
            userId: {[Op.in]: secondDegreeFriendIds},
            friendId: {[Op.ne]: Array.prototype.concat([con.user.id], secondDegreeFriendIds)}
        }, 3, connections);

        console.log(`#### THIRD DEGREE FRIENDIDS ::: `, thirdDegreeFriendIds);
    }

    console.log("### CONNECTIONS ARRAY ===> ", connections);
    await ConnectionRepo.conversationBulkConnectionCreate(connections);
    console.log("#### TOTAL CONNECTION CREATED ===> ", connections.length);
}

async function migrateConnection(userId) {
    const user = await UserRepo.userDetail({searchParams: {id: userId}});

    let connections = [];

    let firstDegreeFriendIds = await getFriends(user, {userId: user.id}, 1, connections);

    let secondDegreeFriendIds = await getFriends(user, {
        userId: {[Op.in]: firstDegreeFriendIds},
        friendId: {[Op.notIn]: Array.prototype.concat([user.id], firstDegreeFriendIds)}
    }, 2, connections);

    await getFriends(user, {
        userId: {[Op.in]: secondDegreeFriendIds},
        friendId: {[Op.ne]: Array.prototype.concat([user.id], secondDegreeFriendIds)}
    }, 3, connections);

    // console.log('==>', connections);
    await ConnectionRepo.conversationBulkConnectionCreate(connections);
}

async function getFriends(user, searchParams, degree, connections, paranoid = true) {
    let friends = await FriendRepo.friendList({
        searchParams: searchParams,
        include: [{
            model: UserModel,
            attributes: {exclude: ['password']}
        }],
        paranoid: paranoid
    });

    let friendIds = [];

    friends.forEach(friend => {
        friend = friend.toJSON();
        if (friend.user) {
            friendIds.push(friend.friendId);
            connections.push({
                userMetaId: user.userMetaId,
                userId: user.id,
                friendMetaId: friend.user.userMetaId,
                friendId: friend.friendId,
                isFavorite: friend.isFavorite,
                degree: degree
            });
        } else {
            console.error('invalid friend', user.id, friend.id);
        }
    });

    return friendIds;
}

