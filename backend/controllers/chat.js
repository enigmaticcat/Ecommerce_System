const Message = require('../models/chat');
const User = require('../models/user');
const { cache } = require('../config/redis');

const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.user;
        const { otherUserId, page = 1, limit = 50 } = req.query;

        if (!otherUserId) {
            return res.status(400).json({
                err: 1,
                msg: 'otherUserId is required'
            });
        }

        const roomId = Message.getRoomId(userId, otherUserId);
        
        // Check cache
        const cacheKey = `chat:${roomId}:messages:page${page}`;
        const cachedMessages = await cache.get(cacheKey);
        
        if (cachedMessages) {
            return res.status(200).json({
                ...cachedMessages,
                cached: true
            });
        }

        // Get messages
        const messages = await Message.find({ roomId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('sender', 'name email avatar')
            .populate('receiver', 'name email avatar');

        const total = await Message.countDocuments({ roomId });

        const response = {
            err: 0,
            msg: 'OK',
            roomId,
            messages: messages.reverse(),
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            hasMore: (page * limit) < total
        };
        await cache.set(cacheKey, response, 300);

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            err: -1,
            msg: 'Failed to get chat history: ' + error.message
        });
    }
};

const getConversations = async (req, res) => {
    try {
        const { userId } = req.user;

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { receiver: userId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: "$roomId",
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $eq: ["$receiver", userId] },
                                        { $eq: ["$isRead", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'lastMessage.sender',
                    foreignField: '_id',
                    as: 'senderInfo'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'lastMessage.receiver',
                    foreignField: '_id',
                    as: 'receiverInfo'
                }
            },
            {
                $project: {
                    roomId: '$_id',
                    lastMessage: 1,
                    unreadCount: 1,
                    otherUser: {
                        $cond: [
                            { $eq: [{ $arrayElemAt: ['$senderInfo._id', 0] }, userId] },
                            { $arrayElemAt: ['$receiverInfo', 0] },
                            { $arrayElemAt: ['$senderInfo', 0] }
                        ]
                    }
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        res.status(200).json({
            err: 0,
            msg: 'OK',
            conversations
        });
    } catch (error) {
        res.status(500).json({
            err: -1,
            msg: 'Failed to get conversations: ' + error.message
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { userId } = req.user;
        const { messageIds } = req.body;

        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({
                err: 1,
                msg: 'messageIds array is required'
            });
        }

        await Message.updateMany(
            {
                _id: { $in: messageIds },
                receiver: userId
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        const messages = await Message.find({ _id: { $in: messageIds } });
        const roomIds = [...new Set(messages.map(msg => msg.roomId))];
        
        for (const roomId of roomIds) {
            await cache.del(`chat:${roomId}:messages:*`);
        }
        await cache.del(`chat:${userId}:unread`);

        res.status(200).json({
            err: 0,
            msg: 'Messages marked as read'
        });
    } catch (error) {
        res.status(500).json({
            err: -1,
            msg: 'Failed to mark as read: ' + error.message
        });
    }
};

module.exports = {
    getChatHistory,
    getConversations,
    markAsRead
};