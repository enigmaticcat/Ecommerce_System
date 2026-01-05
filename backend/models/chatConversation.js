import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatConversationSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    messages: [messageSchema],
    metadata: {
        // Store user preferences extracted from conversation
        preferences: {
            gender: String,
            height: Number,
            weight: Number,
            style: String
        }
    }
}, {
    timestamps: true
});

// Index for efficient queries
chatConversationSchema.index({ userId: 1, updatedAt: -1 });
chatConversationSchema.index({ sessionId: 1, updatedAt: -1 });

// Method to add a message
chatConversationSchema.methods.addMessage = function (role, content) {
    this.messages.push({ role, content, timestamp: new Date() });
    // Keep only last 20 messages to prevent document from growing too large
    if (this.messages.length > 20) {
        this.messages = this.messages.slice(-20);
    }
    return this.save();
};

// Method to get recent messages for context
chatConversationSchema.methods.getRecentMessages = function (count = 10) {
    return this.messages.slice(-count);
};

const chatConversationModel = mongoose.models.chatConversation ||
    mongoose.model('chatConversation', chatConversationSchema);

export default chatConversationModel;
