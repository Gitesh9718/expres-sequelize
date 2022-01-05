'use strict';

const UserAnalyticsRepo = require('app/Repositories/UserAnalyticsRepository');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('models');

module.exports = {
    StoreUserAnalytics: StoreUserAnalytics,
    getUserAnalytics: getUserAnalytics
}

async function StoreUserAnalytics(req, res, next){
    try{
       let users = await db.sequelize.query('SELECT * FROM users WHERE deletedAt IS null', {type: Sequelize.QueryTypes.SELECT});
       let dataToInsert = [];
         
       //add user analytics for each users
         for(let user of users){
             let userAnalyticObj = {};
             userAnalyticObj['userId'] = user.id;
             userAnalyticObj['awards'] = user.totalAwards;
              //get sum of total posts & comments of user for activity
             let activityCount =  await db.sequelize.query(`SELECT (SELECT COUNT(*) FROM posts WHERE userId = ${user.id} AND deletedAt IS null) + (SELECT COUNT(*) FROM comments WHERE userId = ${user.id} AND deletedAt IS null) AS sum`, {type: Sequelize.QueryTypes.SELECT})
             userAnalyticObj['activity'] =  activityCount[0].sum;
            
            //  //get user's trusted count
             let trustedCount =  await db.sequelize.query(`SELECT COUNT(DISTINCT(userId)) AS count FROM friends WHERE friendId= ${user.id} AND deletedAt IS null`, {type: Sequelize.QueryTypes.SELECT});
             userAnalyticObj['trusted'] = trustedCount[0].count;
            //  //get user featured count
             let featuredCount =  await db.sequelize.query(`SELECT COUNT(DISTINCT(userId)) AS count FROM friends WHERE friendId = ${user.id} AND isFavorite = true AND deletedAt IS null`, {type: Sequelize.QueryTypes.SELECT});
              userAnalyticObj['featured'] = featuredCount[0].count;

            //  //get user favourite(bookmarked)
             let favouriteCount = await db.sequelize.query(`SELECT COUNT(*) AS count FROM favourites WHERE userId = ${user.id} AND deletedAt IS null`, {type: Sequelize.QueryTypes.SELECT});
             userAnalyticObj['bookmarked'] = favouriteCount[0].count;

             //push analytic object in data array
             dataToInsert.push(userAnalyticObj);
         };
           //bulk create user analytics
         if(dataToInsert.length){
             await UserAnalyticsRepo.userAnalyticBulkCreate(dataToInsert);
         }
         
       return next();
    }
    catch(err){
       return next(err);
    }
}

/* GET USER ANALYTICS */

async function getUserAnalytics(req, res, next){
  let userId = req.user.id;

  try{
      let analytics = {};
      let userAnalytics = await UserAnalyticsRepo.userAnalyticDetail({searchParams: {userId: userId}})
      if(!userAnalytics){
          return next({message: _errConstant.NO_USER_ANALYTIC, status: 404});
      }
      analytics['user'] = userAnalytics;
      let friendIds = [];
      let friends = await db.sequelize.query(`SELECT DISTINCT(friendId) AS id FROM friends WHERE userId = ${userId} AND deletedAt IS null`, {type: Sequelize.QueryTypes.SELECT});
      for(let frnd of friends){
        friendIds.push(frnd.id);
      }
      if(!friendIds.length){
        analytics['network'] = {};
      }
      else{
        let friendIdStr = friendIds.join();
        let networkAvgAnalytics = await db.sequelize.query(`SELECT AVG(awards) AS awards, AVG(activity) AS activity, AVG(trusted) AS trusted, AVG(featured) AS featured, AVG(introduced) AS introduced, AVG(reposted) AS reposted, AVG(forwarded) AS forwarded , AVG(bookmarked) AS bookmarked FROM userAnalytics WHERE userId IN(${friendIdStr}) AND deletedAt IS null`, {type: Sequelize.QueryTypes.SELECT});
        if(networkAvgAnalytics){
         analytics['network'] = networkAvgAnalytics[0];
        }
      }

      res.data = analytics;
      return next();
  }
  catch(err){
    return next(err);
  }
}

