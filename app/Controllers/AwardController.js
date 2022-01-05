'use strict'

const AwardRepo = require('app/Repositories/AwardRepository');

module.exports = {
  getAwardList: getAwardList
}


async function getAwardList(req, res, next){
  return next();
    // let awardType = req.params.type;

    // let params = {
    //     searchParams: {
    //         type: awardType
    //     },
    //     order: ['name']
    // }

    // try{
    //   let awards = await AwardRepo.awardList(params);
    //   res.data = {awards}
    //   return next();
    // }
    // catch(err){
    //     return next(err);
    // }

}