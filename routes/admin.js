'use strict';

const authMiddleware = require('middleware/adminAuthMiddleware');
const express = require('express');
const router = express.Router();

const AuthController = require('app/Controllers/Admin/AuthController');
const AnalyticsController = require('app/Controllers/AnalyticsController');
const PostController = require('app/Controllers/Admin/PostController');
const UserController = require('app/Controllers/Admin/UserController');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({status: "success", message: "Meoh API", data: {"version_number": "v1.0.0"}})
});

router.post('/authenticate', AuthController.login);
router.get('/analytics', authMiddleware, AnalyticsController.getAnalytics);
router.get('/posts', authMiddleware, PostController.getAllPosts);
router.get('/posts/:id', authMiddleware, PostController.detailPost);
router.put('/posts/:id', authMiddleware, PostController.updatePost);
router.put('/posts/:id/block', authMiddleware, PostController.blockPost);
router.put('/posts/:id/unblock', authMiddleware, PostController.unblockPost);
router.delete('/posts/:id', authMiddleware, PostController.deletePost);
router.get('/users', authMiddleware, UserController.getAllUsers);
router.put('/users/:id/block', authMiddleware, UserController.blockUser);
router.put('/users/:id/unblock', authMiddleware, UserController.unblockUser);

module.exports = router;
