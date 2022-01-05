/**
 * Created by manoj on 15/4/19.
 */

const passport = require('passport');
const UserMetaRepo = require('app/Repositories/UserMetaRepository');
const {to} = require('services/util.service');
const Constants = require('app/Constants/constant');
const restrictedRouteForDeactivateUsers = ['/posts', '/conversations'];

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

        if (user.status === Constants.USER_STATUS_DE_ACTIVE) {
            let requestedUri = req.originalUrl.split("?").shift().replace(/\/v[0-9]/, '');
            if (restrictedRouteForDeactivateUsers.indexOf(requestedUri) !== -1) {
                return next({message: 'Please activate your account', status: 422});
            }
        }

        next();
    })(req, res, next);
};
