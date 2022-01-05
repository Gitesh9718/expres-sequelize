'use strict';

// const path = require('path');
const authMiddleware = require('middleware/authMiddleware');
// const ConnectionMiddleware = require('middleware/connectionMiddleware');
const express = require('express');
const router = express.Router();

/* controllers */
const ConversationController = require('app/Controllers/ConversationController');
const ConversationMessageController = require('app/Controllers/ConversationMessageController');

const UserDashboardController = require('app/Controllers/UserDashboardController');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({
        status: 'success',
        message: 'Meoh API',
        data: { version_number: 'v2.0.0' }
    });
});

/* CONVERSATION */
router.get('/conversations', authMiddleware, ConversationController.V2ConversationList);
router.get('/conversations/:id/members', authMiddleware, ConversationController.getConversationMembers);
/* CONVERSATION MESSAGES */
router.get('/conversations/:conversationId/messages', authMiddleware, ConversationMessageController.V2ConversationMessageList);

/* USER DASHBOARD */
router.get('/users/dashboard', authMiddleware, UserDashboardController.getUserDashboardData);

module.exports = router;
