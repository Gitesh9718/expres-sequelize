/**
 * Created by manoj on 7/5/19.
 */

const formidable = require('formidable');
const uuidv4 = require('uuid/v4');
const fs = require('fs');

const FileRepo = require('app/Repositories/FileRepository');
const ImageService = require('app/Services/ImageService');
const AudioService = require('app/Services/AudioService');

/*
 module.exports = {
 create: create
 };
 */

module.exports.create = async function (req, res, next) {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async function (err, fields, files) {
        if (!files || !files.file) {
            return next({ message: _errConstant.REQUIRED_FILE, status: 412 });
        }
        if (!fields.fileType) {
            return next({ message: _errConstant.REQUIRED_FILE_TYPE, status: 412 });
        }

        let name = '';
        let key = '';
        let path = 'public/';

        switch (fields.type) {
        case 'USER_IMAGE':
            path += 'images/users/';
            break;
        case 'POST_IMAGE':
            path += 'images/posts/';
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
            path += 'chats/';
            break;
        }

        if (fields.fileType === 'BASE_64') {
            key = uuidv4() + '.jpg';
            name = key;

            fs.writeFileSync(path + key, fields.file, 'base64');
        } else {
            name = files.file.name;
            key = uuidv4() + files.file.path.slice(files.file.path.lastIndexOf('.'));

            fs.renameSync(files.file.path, path + key);
            // compress the imagefile
            // ImageService.compressImage(path + key)
        }

        // image service
        if (['USER_IMAGE', 'POST_IMAGE', 'BUG_IMAGE', 'CHAT_IMAGE'].includes(fields.type)) {
            ImageService.compressAndResizeImageAccordingToHeight(path + key, 1024)
                .then(info => {
                    console.log('info: ', info);
                })
                .catch(err => {
                    console.error('error while compressing image', err, 'name =>', path + key);
                });
        }

        // audio service
        if (['POST_AUDIO', 'CHAT_AUDIO'].includes(fields.type)) {
            AudioService.optimizeAudioQuality(path, key)
                .then(newKey => {
                    const newName = name.split('.')[0] + '.mp3';
                    FileRepo.fileUpdate({ name: name, key: key }, { name: newName, key: newKey });
                })
                .catch(err => {
                    console.error('error while converting audio to mp3 ', err, 'name =>', path + key);
                });
        }

        try {
            const file = await FileRepo.fileCreate({ name: name, key: key, type: fields.type });
            res.data = file.toJSON();
            next();
        } catch (err) {
            next(err);
        }
    });
};
