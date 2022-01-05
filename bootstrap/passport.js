'use strict';

module.exports = function (app, passport) {
    app.use(passport.initialize());

    // PASSPORT MIDDLEWARE
    require('middleware/passport')(passport);
};
