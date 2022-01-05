const Post 			   = require('./../models').Post;
const User 			   = require('./../models').User;
const Invitation 	 = require('./../models').Invitation;
const Friend     	 = require('./../models').Friend;
const Forward      = require('./../models').Forward;
const db           = require('./../models');
const { to, ReE, ReS } = require('../services/util.service');

let post = async function (req, res, next) {
let post_id, err, post;
post_id = req.params.id;

[err, post] = await to(Post.findOne({where:{id:post_id}}));
if(err) return ReE(res, "err finding post");

if(!post) return ReE(res, "Post not found with id: "+post_id, 404);

req.post = post;
next();
}
module.exports.post = post;

let user = async function (req, res, next) {
  let user_id, err, user;
  user_id = req.params.id;

  [err, user] = await to(User.findOne({where:{id:user_id}}));
  if(err) return ReE(res, "err finding user");

  if(!user) return ReE(res, "User not found with id: "+user_id, 404);

  req.user = user;
  next();
}
module.exports.user = user;

let invitation = async function (req, res, next) {
  let invitation_id, err, invitation;
  invitation_id = req.params.id;

  [err, invitation] = await to(Invitation.findOne({where:{id:invitation_id}}));
  if(err) return ReE(res, "err finding invitation");

  if(!invitation) return ReE(res, "invitation not found with id: "+invitation_id, 404);

  req.invitation = invitation;
  next();
}
module.exports.invitation = invitation;

let friend = async function (req, res, next) {
  let friend_id, err, friend, user;
  friend_id = req.params.id;
  user = req.user;
  
  [err, friend] = await to(Friend.findOne({where:{user_id:user.id, friend_id:friend_id}}));
  if(err) return ReE(res, "err finding friend");

  if(!friend) return ReE(res, "User: "+user.id+" has no friend with id:"+friend_id, 404);

  req.friend = friend;
  next();
}
module.exports.friend = friend;

let forward = async function (req, res, next) {
  let post_id, err, forward, user;
  post_id = req.params.id;
  user = req.user;

  [err, forward] = await to(Forward.findOne({where:{forwarder_id:user.id, post_id:post_id}}));
  if(err) return ReE(res, "err finding forward");

  if(!forward) return ReE(res, "Forward not found.", 404);

  req.forward = forward;
  next();
}
module.exports.forward = forward;

let doit = async function (req, res, next) {

/*  await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true })
  .then ( function () { db.sequelize.sync ({ force: true })})
  .then ( function () { db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true })});
*/
await db.sequelize.sync ({ force: true });

return ReS(res, {message :'successful: true'});
next();
}
module.exports.doit = doit;