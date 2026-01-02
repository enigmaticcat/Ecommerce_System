const socketIO = require('socket.io');
const Message = require('../models/chat');
const User = require('../models/user');
const { cache } = require('../config/redis');

class SocketServer {
    constructor(server) {
        this.io = socketIO(server, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:5173',
                methods: ['GET', 'POST'],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        this.onlineUsers = new Map(); 
        this.setupEvents();
    }

    setupEvents() {
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            socket.on('authenticate', async (userId) => {
                if (userId) {
                    this.onlineUsers.set(userId, socket.id);
                    console.log(`User ${userId} authenticated`);
                    socket.broadcast.emit('user-online', { userId });
                    this.sendOnlineUsers();
                }
            });

            socket.on('join-room', (roomId) => {
                socket.join(roomId);
                console.log(`User joined room: ${roomId}`);
            });

            socket.on('send-message', async (data) => {
                try {
                    const { senderId, receiverId, message, messageType = 'text' } = data;

                    const [sender, receiver] = await Promise.all([
                        User.findById(senderId),
                        User.findById(receiverId)
                    ]);

                    if (!sender || !receiver) {
                        socket.emit('error', 'User not found');
                        return;
                    }

                    const roomId = Message.getRoomId(senderId, receiverId);

                    const newMessage = await Message.create({
                        roomId,
                        sender: senderId,
                        receiver: receiverId,
                        message,
                        messageType
                    });

                    await newMessage.populate('sender', 'name email avatar');
                    await newMessage.populate('receiver', 'name email avatar');

                    await cache.del(`chat:${roomId}:messages`);
                    await cache.del(`chat:${senderId}:unread`);

                    this.io.to(roomId).emit('receive-message', newMessage);

                    const receiverSocketId = this.onlineUsers.get(receiverId);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit('new-message-notification', {
                            message: newMessage,
                            unreadCount: await this.getUnreadCount(receiverId)
                        });
                    }

                } catch (error) {
                    console.error('Send message error:', error);
                    socket.emit('error', 'Failed to send message');
                }
            });

            socket.on('mark-as-read', async (data) => {
                try {
                    const { messageId, userId } = data;
                    
                    await Message.findByIdAndUpdate(messageId, {
                        isRead: true,
                        readAt: new Date()
                    });

                    const message = await Message.findById(messageId);
                    if (message) {
                        const roomId = Message.getRoomId(message.sender, message.receiver);
                        await cache.del(`chat:${roomId}:messages`);
                        await cache.del(`chat:${userId}:unread`);
                        const senderSocketId = this.onlineUsers.get(message.sender.toString());
                        if (senderSocketId) {
                            this.io.to(senderSocketId).emit('message-read', { messageId });
                        }
                    }
                } catch (error) {
                    console.error('Mark as read error:', error);
                }
            });

            socket.on('get-chat-history', async (data) => {
                try {
                    const { userId1, userId2, page = 1, limit = 50 } = data;
                    const roomId = Message.getRoomId(userId1, userId2);
                    const cacheKey = `chat:${roomId}:messages:page${page}`;
                    const cachedMessages = await cache.get(cacheKey);
                    
                    if (cachedMessages) {
                        socket.emit('chat-history', cachedMessages);
                        return;
                    }

                    const messages = await Message.find({ roomId })
                        .sort({ createdAt: -1 })
                        .skip((page - 1) * limit)
                        .limit(limit)
                        .populate('sender', 'name email avatar')
                        .populate('receiver', 'name email avatar');

                    const response = {
                        roomId,
                        messages: messages.reverse(), // Oldest first
                        page,
                        total: await Message.countDocuments({ roomId })
                    };
                    await cache.set(cacheKey, response, 300);
                    
                    socket.emit('chat-history', response);
                } catch (error) {
                    console.error('Get chat history error:', error);
                    socket.emit('error', 'Failed to load chat history');
                }
            });

            socket.on('typing', (data) => {
                const { roomId, userId, isTyping } = data;
                socket.to(roomId).emit('user-typing', { userId, isTyping });
            });

            socket.on('disconnect', () => {
                for (const [userId, socketId] of this.onlineUsers.entries()) {
                    if (socketId === socket.id) {
                        this.onlineUsers.delete(userId);
                        console.log(`User ${userId} disconnected`);
                        socket.broadcast.emit('user-offline', { userId });
                        break;
                    }
                }
            });
        });
    }

    async sendOnlineUsers() {
        const onlineUsers = Array.from(this.onlineUsers.keys());
        this.io.emit('online-users', onlineUsers);
    }

    async getUnreadCount(userId) {
        const cacheKey = `chat:${userId}:unread`;
        const cachedCount = await cache.get(cacheKey);
        
        if (cachedCount !== null) {
            return cachedCount;
        }

        const count = await Message.countDocuments({
            receiver: userId,
            isRead: false
        });

        await cache.set(cacheKey, count, 60);
        
        return count;
    }

    getIO() {
        return this.io;
    }
}

module.exports = SocketServer;