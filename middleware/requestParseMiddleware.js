const _ = require('lodash');

// for calculating highest depth of an object
function depthOf(object) {
    let level = 0;
    let key;
    for (key in object) {
        if (!object.hasOwnProperty(key)) continue;

        if (typeof object[key] === 'object') {
            let depth = depthOf(object[key]) + 1;
            level = Math.max(depth, level);
        }
    }
    return level;
}

// for deleting null string
function delete_null_properties(test) {
    for (let i in test) {
        if (test[i] === '') {
            // delete test[i];
        } else if (Array.isArray(test[i]) && test[i] && !test[i][0]) {
            // delete test[i];
        } else if (typeof test[i] === 'object') {
            delete_null_properties(test[i]);
        } else if (typeof test[i] === 'string') {
            test[i] = test[i].trim();
        }
    }
}

// for deleting null objects or empty arrays
function delete_Empty_Objects(test) {
    for (let i in test) {
        if (typeof test[i] === 'object') {
            if (_.isEmpty(test[i])) {
                // delete test[i];
            } else {
                delete_Empty_Objects(test[i]);
            }
        } else if (typeof test[i] === 'string') {
            test[i] = test[i].trim();
        }
    }
}


module.exports = {
    parse: function preRequest(req, res, next) {
        let filterObj = _.cloneDeep(req.query) || {};
        let searchQuery = {};
        let sortBy = {};
        let limit = 100;
        let skip = 0;
        if (!_.isEmpty(filterObj)) {
            let page = filterObj.page ? Math.max(1, filterObj.page) : 1;
            delete filterObj.page;

            //for limit checking integer and greater than zero
            if (filterObj.limit && !isNaN(parseInt(filterObj.limit)) && parseInt(filterObj.limit) > 0) {
                limit = parseInt(filterObj.limit);
                if (filterObj.limit > 100) {
                    limit = 100;
                }
            }
            delete filterObj.limit;
            //for skip checking integer and greater than zero
            skip = limit * (page - 1);

            delete filterObj.skip;

            _.forEach(filterObj, function (value, key) {
                if (value && typeof value === "string") {
                    searchQuery[key] = value.trim();
                }
            });
        }
        req.limit = limit;
        if (!req.query.skip) {
            req.skip = skip;
        } else {
            req.skip = parseInt(req.query.skip);
        }
        req.sortBy = sortBy;
        req.searchQuery = searchQuery;

        // parsing empty objects or array or empty string and deleting the empty key
        // trimming string values
        try {
            if ((req.method == "POST" || req.method == "PATCH") && req.body) {
                let level = depthOf(req.body);
                for (let i = 0; i <= level; i++) {
                    delete_null_properties(req.body);
                    delete_Empty_Objects(req.body);
                }
            }
        } catch (e) {
            //continue without parsing
        }
        next();
    }
};

