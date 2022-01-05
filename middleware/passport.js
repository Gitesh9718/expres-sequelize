const {ExtractJwt, Strategy} = require('passport-jwt');
const UserRepo = require('app/Repositories/UserRepository');

module.exports = function (passport) {
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = _config.jwt_encryption;

    passport.use(new Strategy(opts, async function (jwt_payload, done) {
        let err, user;

        try {
            user = await UserRepo.userDetail({searchParams: {id: jwt_payload.userId}});
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, false);
        }

    }));
};
