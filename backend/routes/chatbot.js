
import express from 'express';
import { chatWithAI, getChatHistory, clearChatHistory } from '../controllers/chatbot.js';
import optionalAuth from '../middleware/optionalAuth.js';

const chatbotRouter = express.Router();

// Using optionalAuth - chatbot works for guests, but can use userId if logged in
chatbotRouter.post('/ask', optionalAuth, chatWithAI);
chatbotRouter.get('/history', optionalAuth, getChatHistory);
chatbotRouter.delete('/clear', optionalAuth, clearChatHistory);

export default chatbotRouter;
