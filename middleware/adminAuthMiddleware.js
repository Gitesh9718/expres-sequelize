/**
 * Created by manoj on 15/4/19.
 */

const passport = require('passport');
const UserMetaRepo = require('app/Repositories/UserMetaRepository');
const {to} = require('services/util.service');

module.exports = function (req, res, next) {
    passport.authenticate('jwt', {session: false}, async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next({status: 401, message: "unauthorisedAccess"});
        }
        let userMeta;

        req.user = user;

        let userMetaParams = {
            searchParams: {id: user.userMetaId}
        };
        [err, userMeta] = await to(UserMetaRepo.userMetaDetail(userMetaParams));
        if (err) {
            return next({message: err, status: 422});
        }
        req.userMeta = userMeta;
        next();
    })(req, res, next);
};