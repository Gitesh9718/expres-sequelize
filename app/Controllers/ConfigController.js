'use strict';

module.exports = {
    getConfigurations: getConfigurations,
    navigateToStore: navigateToStore
};

async function getConfigurations (req, res, next) {
    const data = {
        android: '1.2.3',
        ios: '1.2.3'
    };
    res.data = { data };

    return next();
}

async function navigateToStore (req, res, next) {
    const ua = req.headers['user-agent'];
    console.log('ua -->', ua);
    const androidPatt = /android/gi;
    const iosPatt = /iphone|mac|macintosh|ios/gi;
    let storeLink;

    if (androidPatt.test(ua)) {
        console.log('an android device');
        storeLink = 'https://play.google.com/store/apps/details?id=com.luezoid.meoh';
    } else if (iosPatt.test(ua)) {
        console.log('an ios device');
        storeLink = 'https://apps.apple.com/us/app/apple-store/id1466786850';
    } else {
        console.log('other');
        storeLink = 'https://play.google.com/store/apps/details?id=com.luezoid.meoh';
    }

    res.redirect(storeLink);
}
