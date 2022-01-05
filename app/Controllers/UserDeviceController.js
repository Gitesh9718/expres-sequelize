/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const UserDeviceRepo = require('app/Repositories/UserDeviceRepository');

module.exports.store = async function (req, res, next) {
    let body = req.body;

    if (!body.type || [_appConstant.DEVICE_TYPE_ANDROID, _appConstant.DEVICE_TYPE_IOS].indexOf(body.type) === -1) {
        return next({message: _errConstant.DEVICE_TYPE_REQUIRED_OR_INVALID, status: 400});
    }
    /*if (!body.uuid) {
     return next({message: 'Device id is required or invalid', status: 400});
     }*/
    if (!body.token) {
        return next({message: _errConstant.DEVICE_TOKEN_REQUIRED_OR_INVALID, status: 400});
    }

    body['userId'] = req.user.id;

    try {
        let existingDevice = await UserDeviceRepo.userDeviceDetail({searchParams: {token: body.token}});
        if (existingDevice && existingDevice.userId !== req.user.id) {
            await UserDeviceRepo.userDeviceDelete({id: existingDevice.id});
            existingDevice = null;
        }

        if (!existingDevice) {
            await UserDeviceRepo.userDeviceCreate(body);
        }
        next();
    } catch (err) {
        next(err);
    }
};
