/**
 * Created by manoj on 30/5/19.
 */
'use strict';

const {feedback} = require('models');
const BaseRepo = require('app/Repositories/BaseRepository');

module.exports.feedbackCreate = async function (data) {
    return BaseRepo.baseCreate(feedback, data);
};

module.exports.feedbackDetail = async function (params) {
    return BaseRepo.baseDetail(feedback, params)
};

module.exports.feedbackUpdate = async function (searchParams, data) {
    return BaseRepo.baseUpdate(feedback, searchParams, data);
};

module.exports.feedbackList = async function (params) {
    return BaseRepo.baseList(feedback, params)
};