const express = require('express');
const chatController = require('../controllers/chat');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.use(verifyToken);


router.get('/history', chatController.getChatHistory);
router.get('/conversations', chatController.getConversations);
router.post('/mark-read', chatController.markAsRead);

module.exports = router;