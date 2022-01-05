'use strict';


const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {user, file, award, awardMapping} = require('models');

const AwardMappingRepo = require('app/Repositories/AwardMappingRepository');
const AwardRepo = require('app/Repositories/AwardRepository');
const UserRepo = require('app/Repositories/UserRepository');
const PostRepo = require('app/Repositories/PostRepository');
const CommentRepo = require('app/Repositories/CommentRepository');
const NotificationRepo = require('app/Repositories/NotificationRepository');
const CoinTransactionRepo = require('app/Repositories/CoinTransactionRepository');


module.exports = {
    allocateAwards: allocateAwards,
    getPostAwards: getPostAwards,
    getCommentAwards: getCommentAwards,
    getUserAwards: getUserAwards,
    getUserAllAwards: getUserAllAwards,

    getPostAllAwards: getPostAllAwards,
    getCommentAllAwardList: getCommentAllAwardList
};

async function allocateAwards(req, res, next) {
     
    return next();
    // let body = req.body;
    // body['presenterId'] = req.user.id;

    // if (!body.typeId) {
    //     return next({message: _errConstant.REQUIRED_TYPE_ID, status: 400});
    // }
    // if (!body.awards || !Array.isArray(body.awards) || body.awards.length === 0) {
    //     return next({message: _errConstant.REQUIRED_AWARD_ID, status: 400});
    // }
    // //type must be one of the 3 value
    // if (['USER', 'POST', 'COMMENT'].indexOf(body.type) === -1) {
    //     return next({message: _errConstant.INVALID_TYPE, status: 400});
    // }

    // try {
    //     //get user current coins 
    //     const userCoins = req.user.coins;
    //     const awardsLength = body.awards.length;

    //     const coinsDeduct = awardsLength * _appConstant.AWARD_ALLOCATE_COINS;
    //     //check if coins are not sufficient
    //      if(userCoins + coinsDeduct < 0){
    //          return next({message: _errConstant.NOT_ENOUGH_COINS, status: 400});
    //      }

    //     let userId = null;
    //     let postId = null;
    //     let commentId = null;

    //     switch (body.type) {
    //         case 'USER':
    //             userId = body.typeId;
    //             break;
    //         case 'POST':
    //             const post = await PostRepo.postDetail({searchParams: {id: body.typeId}});
    //             if (!post) {
    //                 throw {message: _errConstant.NO_PUBLICATION, status: 400}
    //             }
    //             postId = post.id;
    //             userId = post.userId;
    //             break;
    //         case 'COMMENT':
    //             const comment = await CommentRepo.commentDetail({searchParams: {id: body.typeId}});
    //             if (!comment) {
    //                 throw {message: _errConstant.NO_CONTRIBUTION, status: 400}
    //             }
    //             userId = comment.userId;
    //             postId = comment.postId;
    //             commentId = comment.id;
    //             break;
    //     }

    //     if (userId === req.user.id) {
    //         return next({message: _errConstant.SELF_AWARD_ERROR, status: 400})
    //     }

    //     let dataToInsert = [];
    //     body.awards.forEach(award => {
    //         dataToInsert.push({
    //             type: body.type,
    //             typeId: body.typeId,
    //             awardId: award,
    //             presenterId: req.user.id,
    //             userId: userId
    //         });
    //     });

    //     await AwardMappingRepo.awardMappingBulkCreate(dataToInsert);

    //     //update users, deduct coins for giving award
    //    await UserRepo.userCoinsUpdate(req.user.id, coinsDeduct);
    
    //     //create coinTransaction log 
    //     let coinTransactionObj = {
    //         userId: req.user.id,
    //         coins: coinsDeduct
    //     }

    //     let notificationObj = {
    //         type: _appConstant.NOTIFICATION_TYPE_AWARD_USER,
    //         actionOwnerId: req.user.id,
    //         userId: userId,
    //         text: req.user.name + ' gave you awards'
    //     };

    //     switch (body.type) {
    //         case 'USER':
    //            //coin transaction log
    //             await CoinTransactionRepo.coinTransactionCreate({
    //                 ...coinTransactionObj,
    //                 type: _appConstant.COINS_TRANSACTION_TYPE_AWARD_USER,
    //                 typeId: userId
    //                 });

    //            //notification
    //             notificationObj.type = _appConstant.NOTIFICATION_TYPE_AWARD_USER;
    //             await NotificationRepo.notificationCreate({
    //                 ...notificationObj,
    //                 text: req.user.name + " has given you awards"
    //             });
    //             await UserRepo.userTotalAwardsCountInc(userId, dataToInsert.length);
    //             break;
    //         case 'POST':
    //             //coin transaction log
    //             await CoinTransactionRepo.coinTransactionCreate({
    //                 ...coinTransactionObj,
    //                 type: _appConstant.COINS_TRANSACTION_TYPE_AWARD_POST,
    //                 typeId: postId
    //             });

    //           //notification
    //             notificationObj.type = _appConstant.NOTIFICATION_TYPE_AWARD_POST;
    //             notificationObj['postId'] = body.typeId;
    //             await NotificationRepo.notificationCreate({
    //                 ...notificationObj,
    //                 postId: body.typeId,
    //                 text: req.user.name + " has given awards on your publication"
    //             });
    //             await PostRepo.postTotalAwardsCountInc(body.typeId, dataToInsert.length);
    //             await UserRepo.userTotalAwardsCountInc(userId, dataToInsert.length);
    //             break;
    //         case 'COMMENT':
    //                //coin transaction log
    //             await CoinTransactionRepo.coinTransactionCreate({
    //                 ...coinTransactionObj,
    //                 type: _appConstant.COINS_TRANSACTION_TYPE_AWARD_COMMENT,
    //                 typeId: commentId
    //             });

    //           //notification
    //             notificationObj.type = _appConstant.NOTIFICATION_TYPE_AWARD_COMMENT;
    //             notificationObj['postId'] = postId;
    //             await NotificationRepo.notificationCreate({
    //                 ...notificationObj,
    //                 typeId: body.typeId,
    //                 text: req.user.name + " has given awards on your comment"
    //             });
    //             await CommentRepo.commentTotalAwardsCountInc(body.typeId, dataToInsert.length);
    //             await PostRepo.postTotalAwardsCountInc(postId, dataToInsert.length);
    //             await UserRepo.userTotalAwardsCountInc(userId, dataToInsert.length);
    //             break;
    //     }

    //     return next();
    // } catch (err) {
    //     return next(err);
    // }
}

/* get post awards list */
async function getPostAwards(req, res, next) {
    return next();
    // let postId = req.params.postId;

    // let params = {
    //     searchParams: {type: _appConstant.AWARD_TYPE_POST},
    //     attributes: {
    //         include: [
    //             [Sequelize.literal('(select COUNT(1) from awardMappings where awardMappings.awardId = award.id)'), 'totalAwards']
    //         ]
    //     },
    //     include: [
    //         {
    //             model: awardMapping,
    //             where: {typeId: postId},
    //             include: [{
    //                 model: user,
    //                 as: 'presentingUser',
    //                 attributes: ['id', 'name'],
    //                 include: [{model: file, as: 'profileImage'}]
    //             }],
    //             limit: 3
    //         },

    //     ],
    //     limit: req.limit,
    //     offset: req.skip
    // };

    // try {
    //     let awards = await AwardRepo.awardList(params);
    //     let newAwards = parseAwards(awards);

    //     res.data = {items: newAwards, paginate: {total: awards.count}};

    //     return next();
    // } catch (err) {
    //     return next(err);
    // }
}

/* get comment awards list */
async function getCommentAwards(req, res, next) {
    return next();
    // let commentId = req.params.commentId;

    // let params = {
    //     searchParams: {type: _appConstant.AWARD_TYPE_COMMENT},
    //     attributes: {
    //         include: [
    //             [Sequelize.literal('(select COUNT(1) from awardMappings where awardMappings.awardId = award.id)'), 'totalAwards']
    //         ]
    //     },
    //     include: [
    //         {
    //             model: awardMapping,
    //             where: {typeId: commentId},
    //             include: [{
    //                 model: user,
    //                 as: 'presentingUser',
    //                 attributes: ['id', 'name'],
    //                 include: [{model: file, as: 'profileImage'}]
    //             }],
    //             limit: 3
    //         },

    //     ],
    //     limit: req.limit,
    //     offset: req.skip
    // };

    // try {
    //     let awards = await AwardRepo.awardList(params);
    //     let newAwards = parseAwards(awards);

    //     res.data = {items: newAwards, paginate: {total: awards.count}};

    //     return next();
    // } catch (err) {
    //     return next(err);
    // }

}

/* get user awards list */
async function getUserAwards(req, res, next) {
    return next();
    // let userId = req.params.userId;

    // let params = {
    //     searchParams: {type: _appConstant.AWARD_TYPE_USER},
    //     attributes: {
    //         include: [
    //             [Sequelize.literal('(select COUNT(1) from awardMappings where awardMappings.awardId = award.id)'), 'totalAwards']
    //         ]
    //     },
    //     include: [
    //         {
    //             model: awardMapping,
    //             where: {typeId: userId},
    //             include: [{
    //                 model: user,
    //                 as: 'presentingUser',
    //                 attributes: ['id', 'name'],
    //                 include: [{model: file, as: 'profileImage'}]
    //             }],
    //             limit: 3
    //         },

    //     ],
    //     limit: req.limit,
    //     offset: req.skip
    // };

    // try {
    //     let awards = await AwardRepo.awardList(params);
    //     let newAwards = parseAwards(awards);

    //     res.data = {items: newAwards, paginate: {total: awards.count}};

    //     return next();
    // } catch (err) {
    //     return next(err);
    // }
}


async function getUserAllAwards(req, res, next) {
    return next();
    // let userId = req.params.userId;

    // let awardParams = {
    //     attributes: {
    //         include: [
    //             [Sequelize.literal('(select COUNT(1) from awardMappings where awardMappings.awardId = award.id)'), 'totalAwards']
    //         ]
    //     },
    //     include: [
    //         {
    //             model: awardMapping,
    //             where: {userId: userId},
    //             include: [{
    //                 model: user,
    //                 as: 'presentingUser',
    //                 attributes: ['id', 'name'],
    //                 include: [{model: file, as: 'profileImage'}]
    //             }],
    //             limit: 5
    //         },

    //     ],
    //     limit: req.limit,
    //     offset: req.skip
    // };

    // let mappingParams = {
    //     attributes: ['awardId', [Sequelize.fn('COUNT', 'awardId'), 'count']],
    //     searchParams: {userId: userId},
    //     group: ['awardId'],
    //     order: [[Sequelize.literal('count'), 'DESC']],
    //     limit: req.limit,
    //     offset: req.skip
    // };

    // try {
    //     let mapping = await AwardMappingRepo.awardMappingList(mappingParams);
    //     let awardIds = [];
    //     mapping.rows.forEach(row => {
    //         awardIds.push(row.awardId);
    //     });

    //     if (!awardIds.length) {
    //         res.data = {items: [], paginate: {total: 0}};
    //         next();
    //         return;
    //     }

    //     awardParams['searchParams'] = {id: {[Op.in]: awardIds}};

    //     let awards = await AwardRepo.awardList(awardParams);
    //     let newAwards = parseAwards(awards);

    //     res.data = {items: newAwards, paginate: {total: mapping.count.length}};
    //     // res.data = mapping;

    //     return next();
    // } catch (err) {
    //     return next(err);
    // }
}

function parseAwards(awards) {
    let newAwards = [];

    awards.rows.forEach(row => {
        row = row.toJSON();
        let users = [];
        row['awardMappings'].forEach(awardMapping => {
            users.push(awardMapping.presentingUser);
        });
        row['users'] = users;
        delete row['awardMappings'];
        newAwards.push(row);
    });

    return newAwards;
}

async function getPostAllAwards(req, res, next){
    return next();
    // let postId = req.params.postId;

    // let awardParams = {
    //     attributes: {
    //         include: [
    //             [Sequelize.literal('(select COUNT(1) from awardMappings where awardMappings.awardId = award.id)'), 'totalAwards']
    //         ]
    //     },
    //     include: [
    //         {
    //             model: awardMapping,
    //             where: {typeId: postId, type: _appConstant.AWARD_TYPE_POST},
    //             include: [{
    //                 model: user,
    //                 as: 'presentingUser',
    //                 attributes: ['id', 'name'],
    //                 include: [{model: file, as: 'profileImage'}]
    //             }],
    //             limit: 5
    //         },

    //     ],
    //     limit: req.limit,
    //     offset: req.skip
    // };

    // let mappingParams = {
    //     attributes: ['awardId', [Sequelize.fn('COUNT', 'awardId'), 'count']],
    //     searchParams: {typeId: postId, type: _appConstant.AWARD_TYPE_POST},
    //     group: ['awardId'],
    //     order: [[Sequelize.literal('count'), 'DESC']],
    //     limit: req.limit,
    //     offset: req.skip
    // };

    // try {
    //     let mapping = await AwardMappingRepo.awardMappingList(mappingParams);
    //     let awardIds = [];
    //     mapping.rows.forEach(row => {
    //         awardIds.push(row.awardId);
    //     });

    //     if (!awardIds.length) {
    //         res.data = {items: [], paginate: {total: 0}};
    //         next();
    //         return;
    //     }

    //     awardParams['searchParams'] = {id: {[Op.in]: awardIds}};

    //     let awards = await AwardRepo.awardList(awardParams);
    //     let newAwards = parseAwards(awards);

    //     res.data = {items: newAwards, paginate: {total: mapping.count.length}};
    //     // res.data = mapping;

    //     return next();
    // }

    // catch(err){
    //     return next(err);
    // }

 }


async function getCommentAllAwardList(req, res, next){
    return next();
    // let commentId = req.params.commentId;

    // let awardParams = {
    //     attributes: {
    //         include: [
    //             [Sequelize.literal('(select COUNT(1) from awardMappings where awardMappings.awardId = award.id)'), 'totalAwards']
    //         ]
    //     },
    //     include: [
    //         {
    //             model: awardMapping,
    //             where: {typeId: commentId, type: _appConstant.AWARD_TYPE_COMMENT},
    //             include: [{
    //                 model: user,
    //                 as: 'presentingUser',
    //                 attributes: ['id', 'name'],
    //                 include: [{model: file, as: 'profileImage'}]
    //             }],
    //             limit: 5
    //         },

    //     ],
    //     limit: req.limit,
    //     offset: req.skip
    // };

    // let mappingParams = {
    //     attributes: ['awardId', [Sequelize.fn('COUNT', 'awardId'), 'count']],
    //     searchParams: {typeId: commentId, type: _appConstant.AWARD_TYPE_COMMENT},
    //     group: ['awardId'],
    //     order: [[Sequelize.literal('count'), 'DESC']],
    //     limit: req.limit,
    //     offset: req.skip
    // };

    // try {
    //     let mapping = await AwardMappingRepo.awardMappingList(mappingParams);
    //     let awardIds = [];
    //     mapping.rows.forEach(row => {
    //         awardIds.push(row.awardId);
    //     });

    //     if (!awardIds.length) {
    //         res.data = {items: [], paginate: {total: 0}};
    //         next();
    //         return;
    //     }

    //     awardParams['searchParams'] = {id: {[Op.in]: awardIds}};

    //     let awards = await AwardRepo.awardList(awardParams);
    //     let newAwards = parseAwards(awards);

    //     res.data = {items: newAwards, paginate: {total: mapping.count.length}};
    //     // res.data = mapping;

    //     return next();
    // }
    // catch(err){
    //     return next(err);
    // }

}
