module.exports = {
    USER_HIDDEN_FIELDS: ['password', 'publicKey', 'privateKey'],
    USER_BASIC_INFO_FIELDS: ['id', 'name', 'image'],
    USER_STATUS_ACTIVE: 'ACTIVE',
    USER_STATUS_DE_ACTIVE: 'DE_ACTIVATE',
    USER_STATUS_BLOCK: 'BLOCK',

    POST_TYPE_POST: 'POST',
    POST_TYPE_REQUEST: 'REQUEST',

    ADMIN_EMAILS: ['stroombank@gmail.com', 'gael@meoh.io', 'stroombank@gmail.com'],

    CHAT_TYPE_SINGLE: 'SINGLE',
    CHAT_TYPE_GROUP: 'GROUP',
    CHAT_ROLE_ADMIN: 'ADMIN',
    CHAT_ROLE_USER: 'USER',

    NOTIFICATION_TYPE_INVITATION: 'INVITATION',
    NOTIFICATION_TYPE_INVITATION_ACCEPT: 'INVITATION_ACCEPT',
    NOTIFICATION_TYPE_FEATURE: 'FEATURE',
    NOTIFICATION_TYPE_COMMENT: 'COMMENT',
    NOTIFICATION_TYPE_COMMENT_REPLY: 'COMMENT_REPLY',
    NOTIFICATION_TYPE_FORWARD: 'FORWARD',
    NOTIFICATION_TYPE_BOOKMARK: 'BOOKMARK',
    NOTIFICATION_TYPE_MESSAGE: 'MESSAGE',
    NOTIFICATION_TYPE_APP_UPDATE: 'APP_UPDATE',
    NOTIFICATION_TYPE_AWARD_USER: 'AWARD_USER',
    NOTIFICATION_TYPE_AWARD_POST: 'AWARD_POST',
    NOTIFICATION_TYPE_AWARD_COMMENT: 'AWARD_COMMENT',
    NOTIFICATION_TYPE_NEW_GROUP_ADMIN: 'NEW_GROUP_ADMIN',

    DAILY_NOTIFICATIONS_TYPES: ['FEATURE', 'COMMENT', 'COMMENT_REPLY', 'FORWARD', 'BOOKMARK', 'AWARD_USER', 'AWARD_POST', 'AWARD_COMMENT'],
    DAILY_NOTIFICATIONS_TEXT: 'Your network is up to something. Check it out!',

    COINS_TRANSACTION_TYPE_REGISTERATION: 'REGISTERATION',
    COINS_TRANSACTION_TYPE_PROFILE_PIC_UPLOAD: 'PROFILE_PIC_UPLOAD',
    COINS_TRANSACTION_TYPE_INVITATION_ACCEPT: 'INVITATION_ACCEPT',
    COINS_TRANSACTION_TYPE_FRIEND_INVITATION_ACCEPT: 'FRIEND_INVITATION_ACCEPT',
    COINS_TRANSACTION_TYPE_INTRODUCE: 'INTRODUCE',
    COINS_TRANSACTION_TYPE_AWARD_USER: 'AWARD_USER',
    COINS_TRANSACTION_TYPE_AWARD_POST: 'AWARD_POST',
    COINS_TRANSACTION_TYPE_AWARD_COMMENT: 'AWARD_COMMENT',

    REGISTERATION_COINS: 300,
    UPLOAD_PROFILE_PIC_COINS: 200,
    INVITATION_ACCEPTED_COINS: 100,
    FRIEND_INVITATION_ACCEPTED_COINS: 2,
    INTRODUCE_COINS: 20,
    AWARD_ALLOCATE_COINS: -80,

    DEVICE_TYPE_ANDROID: 'ANDROID',
    DEVICE_TYPE_IOS: 'IOS',

    INVITATION_EXPIRE_DAYS: 14,
    MAX_FEATURE_FRIENDS: 72,
    MAX_FRIENDS: 144,

    AWARD_TYPE_COMMENT: 'COMMENT',
    AWARD_TYPE_POST: 'POST',
    AWARD_TYPE_USER: 'USER',

    DEFAULT_USER_IMAGE_ID: 1597,

    POST_STATUS_OPEN: 'OPEN',
    POST_STATUS_CLOSED: 'CLOSED',

    ALREADY_PINNED: 'MESSAGE IS ALREADY PINNED',
    ALREADY_UNPINNED: 'MESSAGE IS NOT PINNED',

    DASHBOARD_POST_COMMENTED: 'POST_COMMENTED',
    DASHBOARD_POST_REPOSTED: 'POST_REPOSTED',
    DASHBOARD_POST_FORWARDED: 'POST_FORWARDED',
    DASHBOARD_POST_BOOKMARKED: 'POST_BOOKMARKED',
    DASHBOARD_POST_AWARDED: 'POST_AWARDED'

};
