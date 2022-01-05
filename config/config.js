require('dotenv').config();//instatiate environment variables

let CONFIG = {} //Make this global to use all over the application

CONFIG.app = process.env.APP || 'dev';
CONFIG.APP_URL = process.env.APP_URL;
CONFIG.port = process.env.PORT || '3000';
CONFIG.node_env = process.env.NODE_ENV;
CONFIG.maxFriends = 144;
CONFIG.EMAIL_SECRET = process.env.EMAIL_SECRET;

CONFIG.mail = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PW
    }
};
CONFIG.PUBNUB = {
    PUBLISH_KEY: 'pub-c-5cba3622-5e22-4672-8069-a25e30c07531',
    SUBSCRIBE_KEY: 'sub-c-d1e3f31a-d549-11e9-a219-a2442d3e7ccc',
    SECRET_KEY: 'sec-c-NjVlZjM4ZjYtNThmMi00ZGIzLWJiOWItZGM2OWQ4NTBlNzc5',
    USER_CHAT_CHANNEL: 'conversation_{conversationId}_user_{selfId}'
};
CONFIG.mail_from = process.env.MAIL_FROM_STRING;

CONFIG.app_download = process.env.APP_DOWNLOAD_LINK;

CONFIG.xmpp = {
    service: process.env.XMPP_SERVICE,
    domain: process.env.XMPP_DOMAIN,
    resource: process.env.XMPP_RESOURCE,
    username: process.env.XMPP_USERNAME,
    password: process.env.XMPP_PASSWORD
};

CONFIG.development = {

    dialect: process.env.DB_DIALECT,    // 'mysql';
    host: process.env.DB_HOST,       // 'localhost';
    port: process.env.DB_PORT,       // '3306';
    database: process.env.DB_NAME,       // 'name';
    username: process.env.DB_USER,       // 'root';
    password: process.env.DB_PASSWORD,   // 'db-password';
    logging: console.log
};

CONFIG.production = {
    dialect: process.env.DB_DIALECT,    // 'mysql';
    host: process.env.DB_HOST,       // 'localhost';
    port: process.env.DB_PORT,       // '3306';
    database: process.env.DB_NAME,       // 'name';
    username: process.env.DB_USER,       // 'root';
    password: process.env.DB_PASSWORD,   // 'db-password';
    logging: false
};

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || 'jwt_please_change';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '10000';

CONFIG.encryption = {
    key: 'f3e9c272288e847af3e569043df47b3a7f37d0a98d3b12a81b0497aa4e79ae3a',
    iv: '580683f35bd562e99eacd418b76557e4'
}

module.exports = CONFIG;
