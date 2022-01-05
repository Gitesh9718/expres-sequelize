'use strict';

const fs = require('fs');
const ejs = require('ejs');

module.exports = {
    generateOtp: generateOtp,
    generateReferralCode:  generateReferralCode,
    getHtml: getHtml,
    getViewHtml: getViewHtml
};

function generateOtp() {
    // if (isProduction) {
    //     return 123456;
    // }
    return Math.floor(100000 + Math.random() * 900000);
}

function getViewHtml(template, templateData) {
    let templatePath = 'views/' + template;

    return getHtml(templatePath, templateData);
}

function getHtml(templatePath, templateData) {
    let template = fs.readFileSync(templatePath, 'utf-8');

    return ejs.render(template, templateData);
}


function generateReferralCode(length) {
    length = length ? (length + 2) : 8;
    return Math.random().toString(36).substring(2, length);
}
