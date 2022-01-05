/**
 * Created by manoj on 8/7/19.
 */

const HashTagRepo = require('app/Repositories/HashTagRepository');
const PostHashTagRepo = require('app/Repositories/PostHashTagRepository');

module.exports.mapHashTags = async function (post, userHashTags) {
    let hashTags = [];
    userHashTags.forEach(hashTag => {
        hashTag = hashTag.toLowerCase().replace(/[\s,#]/g, '');
        if (hashTag) {
            hashTags.push(hashTag);
        }
    });

    let postHashTags = [];

    let hashTagParams = {
        searchParams: {name: hashTags}
    };

    try {
        let dbHashTags = await HashTagRepo.hashTagList(hashTagParams);

        dbHashTags.forEach(tag => {
            postHashTags.push(tag.id);
            // postHashTags.push({postId: post.id, hashTagId: tag.id});
            hashTags.splice(hashTags.indexOf(tag.name), 1);
        });

        if (hashTags.length) {
            let hashTagData = hashTags.map(val => {
                return {name: val.toLowerCase()}
            });

            dbHashTags = await HashTagRepo.hashTagBulkCreate(hashTagData);

            dbHashTags.forEach(tag => {
                postHashTags.push(tag.id);
                // postHashTags.push({postId: post.id, hashTagId: tag.id});
                hashTags.splice(hashTags.indexOf(tag.name), 1);
            });
        }
        return await post.setHashTags(postHashTags);
        // return await PostHashTagRepo.postHashTagBulkCreate(postHashTags);
    } catch (err) {
        throw (err);
    }
};