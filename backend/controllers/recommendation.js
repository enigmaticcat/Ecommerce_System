import productModel from "../models/product.js";
import orderModel from "../models/order.js";
import { getSimilarByEmbedding } from "../services/ragService.js";

/**
 * Get personalized recommendations for a user
 * Algorithm:
 * 1. Get user's order history → lookup product IDs from DB to get categories
 * 2. Find products in same categories (not already purchased)
 * 3. Sort by bestseller + recency
 * 4. Return top N recommendations
 */
const getRecommendationsForUser = async (req, res) => {
    try {
        // Support both req.userId (from middleware) and req.body.userId
        const userId = req.userId || req.body.userId;
        const limit = parseInt(req.query.limit) || 8;

        let recommendedProducts = [];
        let purchasedProductIds = new Set();
        let userCategories = new Set();
        let userSubCategories = new Set();

        if (userId) {
            // Get user's order history
            const orders = await orderModel.find({ userId }).sort({ date: -1 }).limit(5);

            // Collect all product IDs from orders
            const productIdsFromOrders = [];
            for (const order of orders) {
                for (const item of order.items) {
                    const productId = item._id?.toString() || item.productId;
                    if (productId) {
                        purchasedProductIds.add(productId);
                        productIdsFromOrders.push(productId);
                    }
                }
            }

            // Lookup products from DB to get correct categories
            if (productIdsFromOrders.length > 0) {
                const purchasedProducts = await productModel.find({
                    _id: { $in: productIdsFromOrders }
                }).select('category subCategory');

                for (const product of purchasedProducts) {
                    if (product.category) userCategories.add(product.category);
                    if (product.subCategory) userSubCategories.add(product.subCategory);
                }

                console.log(`[Recommendation] User purchased categories: ${Array.from(userCategories).join(', ')}`);
                console.log(`[Recommendation] User purchased subCategories: ${Array.from(userSubCategories).join(', ')}`);
            }

            // If user has purchase history, recommend based on categories
            if (userCategories.size > 0) {
                recommendedProducts = await productModel.find({
                    _id: { $nin: Array.from(purchasedProductIds) },
                    category: { $in: Array.from(userCategories) }  // Match exact category only
                })
                    .sort({ bestseller: -1, date: -1 })
                    .limit(limit);

                console.log(`[Recommendation] Found ${recommendedProducts.length} products in user's categories`);
            }
        }

        // If not enough recommendations and user has categories, DON'T add random products
        // Instead, only show what we have from their categories
        if (recommendedProducts.length < limit && userCategories.size > 0) {
            console.log(`[Recommendation] Only ${recommendedProducts.length} products found in user categories, not padding with random`);
        }

        // Only add popular products if user has NO purchase history (new user/guest)
        if (recommendedProducts.length === 0 && userCategories.size === 0) {
            console.log(`[Recommendation] No purchase history, showing popular products`);
            const popularProducts = await productModel.find({})
                .sort({ bestseller: -1, date: -1 })
                .limit(limit);

            recommendedProducts = popularProducts;
        }

        res.json({
            success: true,
            recommendations: recommendedProducts,
            personalized: userCategories.size > 0
        });

    } catch (error) {
        console.error("Recommendation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get similar products to a given product
 * Uses TF-IDF embedding similarity from RAG service
 * Falls back to category-based if embeddings unavailable
 */
const getSimilarProducts = async (req, res) => {
    try {
        const { productId } = req.params;
        const limit = parseInt(req.query.limit) || 4;

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Try TF-IDF embedding similarity first
        let similarProducts = await getSimilarByEmbedding(productId, limit);
        let method = 'tfidf_embedding';

        // If embedding-based search fails or returns empty, fallback to category-based
        if (!similarProducts || similarProducts.length === 0) {
            console.log("[Recommendation] Falling back to category-based similarity");
            method = 'category_based';

            similarProducts = await productModel.find({
                _id: { $ne: productId },
                $or: [
                    { category: product.category, subCategory: product.subCategory },
                    { category: product.category }
                ]
            })
                .sort({ bestseller: -1, date: -1 })
                .limit(limit)
                .lean();

            // Add similarity score (estimated based on category match)
            similarProducts = similarProducts.map(p => ({
                ...p,
                productId: p._id,
                similarity: p.subCategory === product.subCategory ? 0.9 : 0.7
            }));
        }

        res.json({
            success: true,
            similarProducts: similarProducts.map(p => ({
                _id: p.productId || p._id,
                name: p.name,
                price: p.price,
                image: p.image,
                category: p.category,
                subCategory: p.subCategory,
                similarity: Math.round((p.similarity || 0) * 100)
            })),
            method,
            basedOn: {
                productName: product.name,
                category: product.category,
                subCategory: product.subCategory
            }
        });

    } catch (error) {
        console.error("Similar Products Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get trending/popular products
 */
const getTrendingProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;

        // Get bestsellers and recently added
        const trendingProducts = await productModel.find({ bestseller: true })
            .sort({ date: -1 })
            .limit(limit);

        // If not enough bestsellers, add recent products
        if (trendingProducts.length < limit) {
            const remaining = limit - trendingProducts.length;
            const existingIds = trendingProducts.map(p => p._id.toString());

            const recentProducts = await productModel.find({
                _id: { $nin: existingIds }
            })
                .sort({ date: -1 })
                .limit(remaining);

            trendingProducts.push(...recentProducts);
        }

        res.json({
            success: true,
            trending: trendingProducts
        });

    } catch (error) {
        console.error("Trending Products Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { getRecommendationsForUser, getSimilarProducts, getTrendingProducts };

