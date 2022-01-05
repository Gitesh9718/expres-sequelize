'use strict';

const path = require('path');
const authMiddleware = require('middleware/authMiddleware');
const ConnectionMiddleware = require('middleware/connectionMiddleware');
const express = require('express');
const router = express.Router();

const ConfigController = require('app/Controllers/ConfigController');
const AuthController = require('app/Controllers/AuthController');
const UserController = require('app/Controllers/UserController');
const UserAnalyticsController = require('app/Controllers/UserAnalyticsController');
const PocController = require('app/Controllers/PocController');
const InvitationController = require('app/Controllers/InvitationController');
const PostController = require('app/Controllers/PostController');
const ReportController = require('app/Controllers/ReportController');
const FeedBackController = require('app/Controllers/FeedbackController');
const UserDeviceController = require('app/Controllers/UserDeviceController');
const FavouriteController = require('app/Controllers/FavouriteController');
const FileController = require('app/Controllers/FileController');
const CommentController = require('app/Controllers/CommentController');
const FriendController = require('app/Controllers/FriendController');
const NotificationController = require('app/Controllers/NotificationController');
const ConversationController = require('app/Controllers/ConversationController');
const ConversationMessageController = require('app/Controllers/ConversationMessageController');
const ChatRequestController = require('app/Controllers/ChatRequestController');
const XMPPController = require('app/Controllers/xmpp.controller');
const BlockController = require('app/Controllers/BlockController');
const AwardMappingController = require('app/Controllers/AwardMappingController');
const AwardController = require('../app/Controllers/AwardController');

const NotificationHelper = require('app/Services/NotificationHelper');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({ status: 'success', message: 'Meoh API', data: { version_number: 'v1.0.0' } });
});

/* config */
router.get('/configurations', ConfigController.getConfigurations);
router.get('/stores', ConfigController.navigateToStore);

/* poc */
router.get('/poc', PocController.poc);
router.get('/update-notification', PocController.sendUpdateNotification);
router.get('/meta', PostController.getMeta);
/* INSERT email, password in users table */
router.get('/addUserMeta', PocController.addUserMetaData);
router.put('/map-lastMessage', PocController.mapLastMessageId);
router.get('/map-posts-comments', PocController.mapPostsTotalComments);
router.get('/map-posts-bookmarks', PocController.mapPostsBookmarkedCount);

router.get('/map-conversations-creator', PocController.addConversationCreator);

router.delete('/awardmappings', PocController.removeAwardMappingDeletedAwards);
router.get('/comments-award-recount', PocController.commentAwardsRecount);
router.get('/posts-award-recount', PocController.postAwardsRecount);
router.get('/users-award-recount', PocController.userAwardsRecount);

router.get('/posts-forward-conversationtype', PocController.addConvoTypeInPost);
router.get('/users-totalAwards-recount', PocController.recountUserTotalAwards);

/* AUTH  */
router.post('/authenticate', AuthController.login);
router.post('/authenticate-via-biometric', AuthController.biometricLogin);
router.post('/users/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/reset-password', AuthController.resetPassword);
router.post('/verify-referral', UserController.verifyReferral);

/* USER */
router.get('/self', authMiddleware, UserController.self);
router.post('/users', UserController.register);
router.get('/users', authMiddleware, UserController.get);
router.patch('/users', authMiddleware, UserController.update);
router.get('/users/image/:id', UserController.getImage);
router.put('/users/account-status', authMiddleware, UserController.changeAccountStatus);
router.delete('/users', authMiddleware, UserController.deleteAccount);
router.get('/users/:userId/mutual-friends', authMiddleware, FriendController.getMutualFriends);
router.get('/my-emails', authMiddleware, UserController.getMyEmails);
router.delete('/emails/:emailId', authMiddleware, UserController.removeEmail);
router.post('/other-emails', authMiddleware, UserController.addOtherEmail);
router.get('/confirm-emails/:token', UserController.confirmEmail);
/* user analytics */
router.post('/users-analytic', authMiddleware, UserAnalyticsController.StoreUserAnalytics);
router.get('/users-analytic', authMiddleware, UserAnalyticsController.getUserAnalytics);

/* CHAT */
router.post('/users/:requestedUserId/message-requests', authMiddleware, ChatRequestController.store);
router.get('/message-requests', authMiddleware, ChatRequestController.listRequest);
router.put('/message-requests/:id/accept', authMiddleware, ChatRequestController.acceptRequest);
router.put('/message-requests/:id/reject', authMiddleware, ChatRequestController.rejectRequest);
router.get('/conversations', authMiddleware, ConversationController.conversationList);
router.get('/conversations/:id', authMiddleware, ConversationController.conversationDetail);
router.post('/conversations', authMiddleware, ConversationController.store);
router.delete('/conversations/:conversationId', authMiddleware, ConversationController.conversationDelete);
router.post('/conversations/:conversationId/messages', authMiddleware, ConversationMessageController.store);
router.get('/conversations/:conversationId/messages', authMiddleware, ConversationMessageController.conversationMessageList);
router.put('/conversations/:conversationId/exit', authMiddleware, ConversationController.leaveGroup);
router.put('/conversations/:conversationId/mute', authMiddleware, ConversationController.muteGroup);
router.put('/conversations/:conversationId/unmute', authMiddleware, ConversationController.unmuteGroup);
router.put('/conversations/:conversationId', authMiddleware, ConversationController.conversationUpdate);
router.delete('/conversations/:conversationId/messages/:messageId', authMiddleware, ConversationMessageController.deleteMessage);
router.delete('/conversations/:conversationId/messages/:messageId/user-message/:userMessageId', authMiddleware, ConversationMessageController.deleteUserMessage);
router.post('/conversations/:conversationId/messages/:messageId/forward', authMiddleware, ConversationMessageController.forwardMessage);
router.get('/conversations-unread-message', authMiddleware, ConversationMessageController.unReadConversationMessageCount);
router.post('/conversations/:conversationId/self-introduce', authMiddleware, ConversationMessageController.selfIntroduceToGroup);
router.put('/conversations/:conversationId/messages/:messageId/accept-friend-request', authMiddleware, ConversationMessageController.acceptFriendRequestByMessageId);
router.get('/conversations/:conversationId/posts', authMiddleware, ConversationMessageController.getConversationPosts);
router.put('/conversations/:conversationId/messages/:messageId/user-message/:userMessageId/pin', authMiddleware, ConversationMessageController.pinUserMessage);
router.put('/conversations/:conversationId/messages/:messageId/user-message/:userMessageId/unpin', authMiddleware, ConversationMessageController.unpinUserMessage);
router.get('/conversations/:conversationId/pinned-messages', authMiddleware, ConversationMessageController.getPinnedMessageList);

/* PROFILES */
router.get('/users/profiles', authMiddleware, UserController.users);
router.post('/users/profiles', authMiddleware, UserController.userCreate);
router.get('/users/profiles/:id/login', authMiddleware, UserController.userProfileLogin);
router.get('/users/profile/:userId', authMiddleware, ConnectionMiddleware, UserController.get);
router.get('/users/:userId/posts', authMiddleware, PostController.myPosts);
router.post('/users/:userId/recommend', authMiddleware, ConversationMessageController.recommend);
router.post('/users/:id/report', authMiddleware, ReportController.reportUser);
router.post('/users/:id/likes', authMiddleware, UserController.userStoreLike);
router.get('/users/:id/likes', authMiddleware, UserController.getUserLikesList);
router.get('/users/:id/all-likes', authMiddleware, UserController.getUserAllLikesList);

/* INVITATIONS */
router.get('/referrals', authMiddleware, InvitationController.createReferral);
router.put('/referrals/accept-invite', authMiddleware, InvitationController.acceptInviteByReferralCode);
router.put('/referrals/reject-invite', authMiddleware, InvitationController.rejectInviteByReferralCode);
router.get('/referrals/:code/inviter-detail', authMiddleware, InvitationController.getInviterDetails);

router.post('/invitations', authMiddleware, InvitationController.create);
router.get('/invitations', authMiddleware, InvitationController.getAll);
router.get('/invitations/:id/re-send', authMiddleware, InvitationController.resendInvitation);
router.delete('/invitations/:id/clear', authMiddleware, InvitationController.clearInvitations);
router.delete('/invitations/:id', authMiddleware, InvitationController.destroy);
router.put('/invitations/:id/accept', authMiddleware, InvitationController.acceptInvitation);
router.put('/invitations/:id/reject', authMiddleware, InvitationController.rejectInvitation);
router.put('/invitations/accept-by-referral', authMiddleware, InvitationController.acceptInvitationWithReferral);
router.post('/invitations/:userId/send', authMiddleware, InvitationController.sendInviteToConversationGroupMember);

/* POST */
router.get('/posts', authMiddleware, PostController.getAll);
router.get('/posts/:id', authMiddleware, PostController.detail);
router.post('/posts', authMiddleware, PostController.create);
router.patch('/posts/:id', authMiddleware, PostController.update);
router.delete('/posts/:id', authMiddleware, PostController.deletePost);
router.get('/my-posts', authMiddleware, PostController.myPosts);
router.post('/posts/:id/forward', authMiddleware, PostController.repost);
router.post('/posts/:id/favourites', authMiddleware, FavouriteController.store);
router.put('/posts/:id/favourites', authMiddleware, FavouriteController.store);
router.post('/posts/:id/report', authMiddleware, ReportController.reportPost);
router.post('/posts/:postId/message', authMiddleware, ConversationMessageController.postAsMessage);
router.get('/favourite-posts', authMiddleware, PostController.favouritePosts);
router.get('/favourite-count', authMiddleware, PostController.favouritePostsCount);
router.post('/posts/:id/likes', authMiddleware, PostController.storeLike);
router.put('/posts/:id/likes', authMiddleware, PostController.storeLike);
// get all post likers
router.get('/posts/:id/likers', authMiddleware, PostController.getPostLikersList);

/* COMMENTS */
router.post('/posts/:postId/comments', authMiddleware, CommentController.store);
router.post('/posts/:postId/comments/:commentId/replies', authMiddleware, CommentController.reply);
router.delete('/posts/:postId/comments/:commentId', authMiddleware, CommentController.destroy);
router.get('/posts/:postId/comments', authMiddleware, CommentController.list);
router.post('/posts/:postId/comments/:commentId/likes', authMiddleware, CommentController.storeLike);
router.put('/posts/:postId/comments/:commentId/likes', authMiddleware, CommentController.storeLike);
// get all comment likers
router.get('/posts/:postId/comments/:commentId/likers', authMiddleware, CommentController.getCommentLikersList);

/* CONTRIBUTORS */
router.get('/posts/:postId/contributors', authMiddleware, CommentController.getContributorsList);

/* MARK-UNMARK BEST ANSWER */
router.put('/posts/:postId/:commentId/best', authMiddleware, CommentController.markBestContribution);

/* MESSAGES */
router.post('/messages', authMiddleware, XMPPController.XMPPSendMessage);
router.get('/messages', authMiddleware, XMPPController.XMPPGetMessages);

/* FEEDBACK AND BUG */
router.post('/feedback', authMiddleware, FeedBackController.store);

/* NOTIFICATIONS */
router.get('/notifications', authMiddleware, NotificationController.getAll);
router.get('/notifications/:id', authMiddleware, NotificationController.detail);
router.post('/devices', authMiddleware, UserDeviceController.store);

/* FILE UPLOAD */
router.post('/files', authMiddleware, FileController.create);

/* FRIENDS ROUTE */
router.delete('/friends/:id', authMiddleware, FriendController.remove);
router.patch('/friends/:id', authMiddleware, FriendController.feature);
router.get('/friends', authMiddleware, FriendController.getAll);
router.get('/feature-friends', authMiddleware, FriendController.getFeatureFriends);
router.get('/friends-posts', authMiddleware, FriendController.friendsDailyPostCount);

router.post('/report', authMiddleware, ReportController.report);

/* BLOCK ROUTE */
router.put('/users/:userId/block', authMiddleware, BlockController.blockUser);
router.put('/users/:userId/un-block', authMiddleware, BlockController.unBlockUser);

/* ------- AWARDS ------ */
router.get('/awards/:type', authMiddleware, AwardController.getAwardList);
router.post('/awards', authMiddleware, AwardMappingController.allocateAwards);
router.get('/posts/:postId/awards', authMiddleware, AwardMappingController.getPostAwards);
router.get('/posts/:postId/all-awards', authMiddleware, AwardMappingController.getPostAllAwards);
router.get('/comments/:commentId/awards', authMiddleware, AwardMappingController.getCommentAwards);
router.get('/comments/:commentId/all-awards', authMiddleware, AwardMappingController.getCommentAllAwardList);
router.get('/users/:userId/awards', authMiddleware, AwardMappingController.getUserAwards);
router.get('/users/:userId/all-awards', authMiddleware, AwardMappingController.getUserAllAwards);

// router.post(    '/friends',         passport.authenticate('jwt', {session:false}), FriendController.create);

// router.post('/users/linkedIn', UserController.linkedIn);
// router.delete('/users', authMiddleware, UserController.remove);
// router.get('/users/status', authMiddleware, UserController.getStatus);

// router.delete(  '/posts/:id',       passport.authenticate('jwt', {session:false}), custom.post, PostController.remove);
// router.post('/posts/:id/forward', authMiddleware, PostController.forward);
// router.get('/friends/getfavoritefriends/:id', authMiddleware, custom.user, FriendController.getFavorites);

// router.post('/invitations/accept/:id', authMiddleware, custom.invitation, InvitationController.accept);
// router.post('/invitations/reject/:id', authMiddleware, custom.invitation, InvitationController.remove);
// router.post('/invitations/bymail', authMiddleware, InvitationController.createByMail);
// router.post('/invitations/byuserid', authMiddleware, InvitationController.createByUserId);

// router.post('/hiddenapideletedatabsefortesting', custom.doit);

//* ******** API DOCUMENTATION **********
router.use('/docs/api.json', express.static(path.join(__dirname, '/../public/v1/documentation/api.json')));
router.use('/docs', express.static(path.join(__dirname, '/../public/v1/documentation/dist')));

//* ******** API Tests **********
router.use('/tests/index.html', express.static(path.join(__dirname, '/../tests/index.html')));
router.use('/tests', express.static(path.join(__dirname, '/../tests')));
router.use('/apistuff', express.static(path.join(__dirname, '/../node_modules')));

// router.get('/daily-notifications', PocController.sendDailyNotf);

module.exports = router;
