/* global _appConstant, _errConstant */

'use strict';

const { to } = require('services/util.service');

const UserRepo = require('app/Repositories/UserRepository');
const UserMetaRepo = require('app/Repositories/UserMetaRepository');
const UserDeviceRepo = require('app/Repositories/UserDeviceRepository');
const PasswordResetRepo = require('app/Repositories/PasswordResetRepository');
const NotificationService = require('app/Services/NotificationService');
const UtilityService = require('app/Services/UtilityService');

const { file } = require('models');

module.exports = {
    login: login,
    biometricLogin: biometricLogin,
    linkedIn: linkedIn,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    verifyOtp: verifyOtp
};

async function login (req, res, next) {
    const body = req.body;
    let userMeta, user;

    if (!body.email) {
        return next({ message: _errConstant.REQUIRED_EMAIL, status: 400 });
    }

    const userMetaParams = {
        searchParams: { email: body.email }
    };

    try {
        // todo remove this query and create this object using user table
        userMeta = await UserMetaRepo.userMetaDetail(userMetaParams);

        const userParams = {
            searchParams: { email: body.email },
            include: [
                { model: file, as: 'profileImage' }
            ]
        };

        user = await UserRepo.userDetail(userParams);

        if (!user) {
            return next({ message: _errConstant.NO_ACCOUNT, status: 422 });
        }

        if (!user.comparePassword(body.password)) {
            return next({ message: _errConstant.INVALID_CREDENTIALS, status: 400 });
        }

        if (user.status === _appConstant.USER_STATUS_BLOCK) {
            next({ message: _errConstant.ACCOUNT_BLOCKED, status: 400 });
        }

        const oldUser = user.toWeb();
        // oldUser['email'] = userMeta.email;

        if (!oldUser.privateKey && body.privateKey && body.publicKey) {
            await UserRepo.userUpdate({ id: user.id }, { publicKey: body.publicKey, privateKey: body.privateKey });
            oldUser['publicKey'] = body.publicKey;
            oldUser['privateKey'] = body.privateKey;
        }

        res.data = { token: user.getJWT(), user: oldUser, userMeta: userMeta.toJSON() };

        next();
    } catch (err) {
        next(err);
    }
}

async function biometricLogin (req, res, next) {
    const body = req.body;
    let userDevice, userMeta, user;

    if (!body.uuid) {
        return next({ message: _errConstant.REQUIRED_UUID, status: 400 });
    }
    if (!body.email) {
        return next({ message: _errConstant.REQUIRED_EMAIL, status: 400 });
    }

    const deviceParams = {
        searchParams: { uuid: body.uuid }
    };

    try {
        userDevice = await UserDeviceRepo.userDeviceDetail(deviceParams);

        if (!userDevice) {
            return next({ message: _errConstant.LOGIN_WITH_EMAIL_FIRST, status: 400 });
        }

        const userParams = {
            searchParams: { id: userDevice.userId }
        };

        user = await UserRepo.userDetail(userParams);

        if (!user) {
            return next({ message: _errConstant.NO_USER, status: 400 });
        }

        const userMetaParams = {
            searchParams: { id: user.userMetaId }
        };

        userMeta = await UserMetaRepo.userMetaDetail(userMetaParams);

        if (!userMeta) {
            return next({ message: _errConstant.NO_ACCOUNT, status: 422 });
        }

        const oldUser = user.toWeb();
        oldUser['email'] = userMeta.email;

        res.data = { token: user.getJWT(), user: oldUser, userMeta: userMeta.toJSON() };

        next();
    } catch (err) {
        next(err);
    }
}

async function linkedIn (req, res, next) {
    const Linkedin = require('node-linkedin')('81fnqsyf84fc1w', 'Zqrms578gTuYmHog');

    const linkedin = Linkedin.init('token');

    linkedin.people.me((err, user) => {
        console.log(user, 'All user data attached to this.token');
        let resp = { response: user, error: null };
        if (err) resp = { response: null, error: err };
        else {
            this.email = user.emailAddress;
            this.id = user.id;
        }

        res.data = { data: 'data' };
        return next();
    });
}

async function forgotPassword (req, res, next) {
    const body = req.body;
    let user, userPass;

    if (!body.email) {
        return next({ message: _errConstant.REQUIRED_EMAIL, status: 400 });
    }
    try {
        user = await UserRepo.userDetail({ searchParams: { email: body.email } });

        if (!user) {
            return next({ message: _errConstant.NO_ACCOUNT, status: 422 });
        }

        body.otp = UtilityService.generateOtp();

        userPass = await PasswordResetRepo.passwordResetDetail({ searchParams: { email: body.email } });

        if (!userPass) {
            userPass = await PasswordResetRepo.passwordResetCreate(body);
        }

        // let message = 'Hi ' + (user.name ? user.name : '') + '<br><br> OTP is: <br>' + userPass.otp;
        const message = UtilityService.getViewHtml('reset-password.html', { user: { name: user.name, otp: userPass.otp } });

        NotificationService.sendMail(user, 'Password recovery', message);

        next();
    } catch (err) {
        next(err);
    }
}

async function resetPassword (req, res, next) {
    const body = req.body;

    if (!body.email) {
        return next({ message: _errConstant.REQUIRED_EMAIL, status: 400 });
    }
    if (!body.otp) {
        return next({ message: _errConstant.REQUIRED_OTP, status: 400 });
    }
    if (!body.password) {
        return next({ message: _errConstant.REQUIRED_PASSWORD, status: 400 });
    }

    let err, passResetObj, user;

    [err, passResetObj] = await to(PasswordResetRepo.passwordResetDetail({ searchParams: { email: body.email } }));

    if (err) {
        return next({ message: err, status: 422 });
    }

    if (!passResetObj) {
        return next({ message: _errConstant.NO_OTP, status: 422 });
    }
    if (parseInt(body.otp) !== passResetObj.otp) {
        return next({ message: _errConstant.INVALID_OTP, status: 422 });
    }

    [err, user] = await to(UserMetaRepo.userMetaDetail({ searchParams: { email: body.email } }));
    if (err) {
        return next({ message: err, status: 422 });
    }

    if (!user) {
        return next({ message: _errConstant.INVALID_EMAIL_ID, status: 422 });
    }

    user.set({ password: body.password });

    [err, user] = await to(user.save());
    if (err) {
        return next({ message: err, status: 400 });
    }

    // update in usr table as well
    //  console.log("#####usr meta id####", user.id);
    [err] = await to(UserRepo.userPasswordUpdate({ email: body.email }, { password: body.password }));
    if (err) {
        return next({ message: err, status: 400 });
    }

    [err, passResetObj] = await to(passResetObj.destroy());
    if (err) {
        return next({ message: err, status: 422 });
    }

    next();
}

async function verifyOtp (req, res, next) {
    const body = req.body;

    if (!body.email) {
        return next({ message: _errConstant.REQUIRED_EMAIL, status: 400 });
    }
    if (!body.otp) {
        return next({ message: _errConstant.REQUIRED_OTP, status: 400 });
    }

    let err, passResetObj;

    [err, passResetObj] = await to(PasswordResetRepo.passwordResetDetail({ searchParams: { email: body.email } }));

    if (err) {
        return next({ message: err, status: 422 });
    }

    if (!passResetObj) {
        return next({ message: _errConstant.NO_OTP, status: 422 });
    }
    if (parseInt(body.otp) !== passResetObj.otp) {
        return next({ message: _errConstant.INVALID_OTP, status: 422 });
    }

    next();
}
