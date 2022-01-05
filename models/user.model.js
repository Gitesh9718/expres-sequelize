'use strict';
const bcrypt = require('bcrypt');
const bcrypt_p = require('bcrypt-promise');
const jwt = require('jsonwebtoken');
const { TE, to } = require('../services/util.service');
const CONFIG = require('config/config');

module.exports = (sequelize, DataTypes) => {
    const Model = sequelize.define('user', {
        id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
        email: { type: DataTypes.STRING(190), allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        userMetaId: { type: DataTypes.BIGINT, allowNull: true, defaultValue: null },
        name: { type: DataTypes.STRING, allowNull: false },
        image: {
            type: DataTypes.TEXT('long'),
            get () {
                /* if (this.getDataValue('profileImage')) {
                        return  this.getDataValue('profileImage')['url'];
                    } */
                if (!this.getDataValue('image')) {
                    return null;
                }
                const id = this.getDataValue('id');
                // 'this' allows you to access attributes of the instance
                return CONFIG.APP_URL + 'v1/users/image/' + id;
            }
        },
        imageId: { type: DataTypes.BIGINT, allowNull: true, defaultValue: null },
        unReadNotificationCount: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
        status: DataTypes.ENUM(_appConstant.USER_STATUS_ACTIVE, _appConstant.USER_STATUS_DE_ACTIVE, _appConstant.USER_STATUS_BLOCK),
        city: DataTypes.STRING,
        country: DataTypes.STRING,
        company: DataTypes.STRING,
        position: DataTypes.STRING,
        expertise: { type: DataTypes.STRING(500), allowNull: true },
        about: DataTypes.TEXT,
        education: DataTypes.TEXT,
        fieldOfStudy: DataTypes.STRING,
        educationDegree: { type: DataTypes.TEXT, allowNull: true },
        school: DataTypes.STRING,
        linkedinUrl: { type: DataTypes.STRING(500), allowNull: true },
        twitterUrl: { type: DataTypes.STRING(500), allowNull: true },
        website: DataTypes.TEXT,
        socialLinks: DataTypes.TEXT,
        whyIamHere: { type: DataTypes.STRING(500), allowNull: true },
        interests: { type: DataTypes.STRING(500), allowNull: true },
        sideProjects: { type: DataTypes.STRING(500), allowNull: true },
        askMeAbout: { type: DataTypes.STRING(500), allowNull: true },
        lookingFor: { type: DataTypes.STRING(500), allowNull: true },
        quoteILike: { type: DataTypes.STRING(500), allowNull: true },
        artOrMusicILike: { type: DataTypes.STRING(500), allowNull: true },
        isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
        last_seen_post: DataTypes.BIGINT,
        color: DataTypes.STRING,
        publicKey: DataTypes.TEXT,
        privateKey: DataTypes.TEXT,
        userAwards: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        totalAwards: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        },
        totalLikes: {
            type: DataTypes.VIRTUAL,
            get () {
                return this.getDataValue('totalAwards');
            }
        },
        coins: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 }
    },
    {
        timestamps: true,
        underscored: false,
        paranoid: true
    });

    Model.associate = function (models) {
        this.Profiles = this.hasMany(models.profile);
        this.Posts = this.hasMany(models.post);
        this.Friends = this.hasMany(models.friend);
        this.Invitations = this.hasMany(models.Invitation);
        this.UserMeta = this.belongsTo(models.userMeta, { as: 'userMeta', foreignKey: 'userMetaId' });
        this.belongsTo(models.file, { as: 'profileImage', foreignKey: 'imageId' });
    };

    Model.beforeSave(async (user, options) => {
        let err;
        if (user.changed('password')) {
            let salt, hash;
            [err, salt] = await to(bcrypt.genSalt(10));
            if (err) TE(err.message, true);

            [err, hash] = await to(bcrypt.hash(user.password, salt));
            if (err) TE(err.message, true);

            user.password = hash;
        }
    });

    /* Model.prototype.comparePassword = async function (pw) {
        let err, pass;
        if (!this.password) TE('password not set');

        [err, pass] = await to(bcrypt_p.compare(pw, this.password));
        if (err) TE(err);

        if (!pass) TE('invalid password');

        return this;
    }; */

    Model.prototype.comparePassword = function (pw) {
        return bcrypt.compareSync(pw, this.password);
    };

    Model.prototype.getJWT = function () {
        const expiration_time = parseInt(CONFIG.jwt_expiration);
        return 'Bearer ' + jwt.sign({ userId: this.id }, CONFIG.jwt_encryption, { expiresIn: expiration_time });
    };

    Model.prototype.toWeb = function (pw) {
        const json = this.toJSON();

        // delete json["image"];
        // json["image_url"] = "/users/image/" + json["id"];

        return json;
    };

    return Model;
};
