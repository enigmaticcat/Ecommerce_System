const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ isRead: 1 });

messageSchema.statics.getRoomId = (userId1, userId2) => {
    const ids = [userId1.toString(), userId2.toString()].sort();
    return `room_${ids.join('_')}`;
};

module.exports = mongoose.model('Message', messageSchema);