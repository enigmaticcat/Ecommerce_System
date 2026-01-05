import express from 'express';
import { getRecommendationsForUser, getSimilarProducts, getTrendingProducts } from '../controllers/recommendation.js';
import optionalAuth from '../middleware/optionalAuth.js';

const recommendationRouter = express.Router();

// Personalized recommendations (works for guests too, but better with login)
recommendationRouter.get('/for-user', optionalAuth, getRecommendationsForUser);

// Similar products to a specific product
recommendationRouter.get('/similar/:productId', getSimilarProducts);

// Trending/popular products
recommendationRouter.get('/trending', getTrendingProducts);

export default recommendationRouter;
