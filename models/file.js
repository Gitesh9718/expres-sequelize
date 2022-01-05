'use strict';

const CONFIG = require('config/config');

module.exports = (sequelize, DataTypes) => {
    let file = sequelize.define('file', {
        name: DataTypes.STRING,
        type: {
            type: DataTypes.ENUM,
            values: ['USER_IMAGE', 'POST_IMAGE', 'BUG_IMAGE', 'CHAT_IMAGE', 'CHAT_VIDEO', 'CHAT_DOCUMENT', 'CHAT_AUDIO', 'POST_AUDIO']
        },
        key: DataTypes.STRING,
        url: {
            type: DataTypes.VIRTUAL,
            get() {
                let path = '';
                switch (this.getDataValue('type')) {
                    case 'USER_IMAGE':
                        path = 'images/users/';
                        break;
                    case 'POST_IMAGE':
                        path = 'images/posts/';
                        break;
                    case 'BUG_IMAGE':
                        path += 'images/bugs/';
                        break;
                    case 'POST_AUDIO':
                        path += 'posts/audio/';
                        break;    
                    case 'CHAT_IMAGE':
                    case 'CHAT_VIDEO':
                    case 'CHAT_DOCUMENT':
                    case 'CHAT_AUDIO':    
                        path = 'chats/';
                        break;
                }
                const id = this.getDataValue('id');
                // 'this' allows you to access attributes of the instance
                return CONFIG.APP_URL + path + this.getDataValue('key');
            }
        }
    }, {
        classMethods: {
            associate: function (models) {
                // associations can be defined here
            }
        }
    });

    return file;
};
