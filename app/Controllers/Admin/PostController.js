'use strict';

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { post } = require('models');
const { user } = require('models');
const { hashTag } = require('models');
const { file } = require('models');
// const { favourite } = require('models');
const moment = require('moment');

const PostRepo = require('app/Repositories/PostRepository');
const ReportPostRepo = require('app/Repositories/ReportPostRepository');

module.exports = {
    getAllPosts: getAllPosts,
    detailPost: detailPost,
    updatePost: updatePost,
    deletePost: deletePost,
    blockPost: blockPost,
    unblockPost: unblockPost,
    reportedPosts: reportedPosts
};

async function reportedPosts (limit, offset) {
    /* const postParams = {
        distinct: true,
        col: 'postId',
        searchParams: {},
        order: [
            ['createdAt', 'DESC']
        ],
        limit: limit,
        offset: offset
    }; */

    try {
        const posts = await ReportPostRepo.reportPostAggregate('postId', 'DISTINCT', { plain: false });
        const postIds = [];

        posts.forEach((p, index) => {
            postIds.push(p['DISTINCT']);
        });

        return new Promise(resolve => resolve(postIds));
    } catch (err) {
        return new Promise(reject => reject(err));
    }
}

async function getAllPosts (req, res, next) {
    let searchParams = {};
    switch (req.searchQuery.status) {
    case 'NEW':
        searchParams = { createdAt: { [Op.gt]: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }) } };
        break;
    case 'LOCKED':
        searchParams = { isBlocked: true };
        break;
    case 'REPORTED':
        const postIds = await reportedPosts(req.limit, req.skip);
        searchParams = { id: { [Op.in]: postIds } };
    }

    const postParams = {
        searchParams: searchParams,
        include: [
            {
                model: post,
                as: 'parentPost',
                include: [
                    { model: user },
                    { model: hashTag },
                    { model: file },
                    { model: file, as: 'audioFile' }
                ]
            },
            { model: user },
            { model: hashTag },
            { model: file },
            { model: file, as: 'audioFile' }
        ],
        order: [
            ['createdAt', 'DESC']
        ],
        limit: req.limit,
        offset: req.skip
    };

    try {
        const posts = await PostRepo.postList(postParams);
        const newPosts = [];

        posts.rows.forEach((p, index) => {
            p = p.toJSON();
            newPosts.push(p);
        });

        res.data = { items: newPosts, paginate: { total: posts.count } };
        return next();
    } catch (err) {
        next(err);
    }
}

async function deletePost (req, res, next) {
    try {
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.id } });
        if (!originalPost) {
            return next({ message: _errConstant.NO_PUBLICATION, status: 400 });
        }

        await PostRepo.postDelete({ id: originalPost.id });

        next();
    } catch (err) {
        next(err);
    }
}

async function updatePost (req, res, next) {
    try {
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.id } });
        if (!originalPost) {
            return next({ message: _errConstant.NO_PUBLICATION, status: 400 });
        }

        // todo restrict content update
        await PostRepo.postUpdate({ id: originalPost.id }, req.body);

        next();
    } catch (err) {
        next(err);
    }
}

async function blockPost (req, res, next) {
    try {
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.id } });
        if (!originalPost) {
            return next({ message: _errConstant.NO_PUBLICATION, status: 400 });
        }

        await PostRepo.postUpdate({ id: originalPost.id }, { isBlocked: true, updatedBy: req.user.id });

        next();
    } catch (err) {
        next(err);
    }
}

async function unblockPost (req, res, next) {
    try {
        const originalPost = await PostRepo.postDetail({ searchParams: { id: req.params.id } });
        if (!originalPost) {
            return next({ message: _errConstant.NO_PUBLICATION, status: 400 });
        }

        await PostRepo.postUpdate({ id: originalPost.id }, { isBlocked: false, updatedBy: req.user.id });

        next();
    } catch (err) {
        next(err);
    }
}

async function detailPost (req, res, next) {
    try {
        const postParams = {
            // attributes: {
            //     include: [
            //         [Sequelize.literal('(select COUNT(*) from comments where comments.postId = post.id and comments.deletedAt is null)'), 'commentCount'],
            //         [Sequelize.literal('(select COUNT(*) from favourites where favourites.postId = post.id and deletedAt is null)'), 'favouriteCount']
            //     ]
            // },
            searchParams: { id: req.params.id },
            include: [
                {
                    model: post,
                    as: 'parentPost',
                    include: [
                        { model: user },
                        { model: hashTag },
                        { model: file },
                        { model: file, as: 'audioFile' }
                    ]
                },
                { model: user },
                { model: hashTag },
                { model: file },
                { model: file, as: 'audioFile' }
            ]
        };
        let originalPost = await PostRepo.postDetail(postParams);
        if (!originalPost) {
            return next({ message: _errConstant.PUBLICATION_DELETED, status: 400 });
        }
        originalPost = originalPost.toJSON();
        res.data = originalPost;

        next();
    } catch (err) {
        next(err);
    }
}
