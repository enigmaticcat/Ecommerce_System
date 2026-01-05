
import productModel from "../models/product.js";
import productEmbeddingModel from "../models/productEmbedding.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// In-memory cache (loaded from DB)
let productIndex = [];
let isIndexLoaded = false;
let vocabulary = new Set();
let idfMap = {};

const tokenize = (text) => {
    if (!text) return [];
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1);
};

const calculateTF = (tokens) => {
    const tf = {};
    tokens.forEach(token => {
        tf[token] = (tf[token] || 0) + 1;
    });
    const total = tokens.length;
    Object.keys(tf).forEach(key => {
        tf[key] = tf[key] / total;
    });
    return tf;
};

const calculateTFIDF = (tokens) => {
    const tf = calculateTF(tokens);
    const tfidf = {};
    Object.keys(tf).forEach(term => {
        tfidf[term] = tf[term] * (idfMap[term] || 1);
    });
    return tfidf;
};

const cosineSimilarity = (vecA, vecB) => {
    const terms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    terms.forEach(term => {
        const a = vecA[term] || 0;
        const b = vecB[term] || 0;
        dotProduct += a * b;
        normA += a * a;
        normB += b * b;
    });

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const createTextContent = (product) => {
    return `
        ${product.name} 
        ${product.description} 
        ${product.category} ${product.subCategory}
        thời trang quần áo giày dép phụ kiện
    `.toLowerCase().trim();
};

const loadIndexFromDB = async () => {
    try {
        console.log("[RAG] Loading embeddings from database...");

        const embeddings = await productEmbeddingModel.getAllEmbeddings();

        if (embeddings.length === 0) {
            console.log("[RAG] No embeddings in DB, building fresh index...");
            return await buildProductIndex();
        }

        const products = await productModel.find({});
        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        const documentFrequency = {};
        embeddings.forEach(emb => {
            const uniqueTokens = new Set(emb.tokens || []);
            uniqueTokens.forEach(token => {
                vocabulary.add(token);
                documentFrequency[token] = (documentFrequency[token] || 0) + 1;
            });
        });

        const N = embeddings.length;
        vocabulary.forEach(term => {
            idfMap[term] = Math.log(N / (documentFrequency[term] || 1)) + 1;
        });

        productIndex = embeddings.map(emb => {
            const product = productMap.get(emb.productId.toString());
            if (!product) return null;

            const tfidf = emb.tfidfVector instanceof Map
                ? Object.fromEntries(emb.tfidfVector)
                : emb.tfidfVector;

            return {
                productId: emb.productId,
                name: product.name,
                description: product.description,
                category: product.category,
                subCategory: product.subCategory,
                price: product.price,
                image: product.image,
                bestseller: product.bestseller,
                tokens: emb.tokens,
                tfidf: tfidf
            };
        }).filter(Boolean);

        isIndexLoaded = true;
        console.log(`[RAG] Loaded ${productIndex.length} embeddings from database`);
        return true;

    } catch (error) {
        console.error("[RAG] Failed to load from DB:", error.message);
        return await buildProductIndex();
    }
};

const buildProductIndex = async () => {
    try {
        console.log("[RAG] Building product index with TF-IDF...");

        const products = await productModel.find({});
        console.log(`[RAG] Found ${products.length} products to index`);

        if (products.length === 0) {
            isIndexLoaded = true;
            return true;
        }

        const documentTokens = [];
        const documentFrequency = {};
        vocabulary = new Set();

        products.forEach(product => {
            const text = createTextContent(product);
            const tokens = tokenize(text);
            documentTokens.push(tokens);

            const uniqueTokens = new Set(tokens);
            uniqueTokens.forEach(token => {
                vocabulary.add(token);
                documentFrequency[token] = (documentFrequency[token] || 0) + 1;
            });
        });

        const N = products.length;
        idfMap = {};
        vocabulary.forEach(term => {
            idfMap[term] = Math.log(N / (documentFrequency[term] || 1)) + 1;
        });

        productIndex = [];

        for (let idx = 0; idx < products.length; idx++) {
            const product = products[idx];
            const tokens = documentTokens[idx];
            const tfidf = calculateTFIDF(tokens);
            const textContent = createTextContent(product);

            await productEmbeddingModel.upsertEmbedding(
                product._id,
                textContent,
                tfidf,
                tokens
            );

            productIndex.push({
                productId: product._id,
                name: product.name,
                description: product.description,
                category: product.category,
                subCategory: product.subCategory,
                price: product.price,
                image: product.image,
                bestseller: product.bestseller,
                tokens: tokens,
                tfidf: tfidf
            });
        }

        isIndexLoaded = true;
        console.log(`[RAG] Index built and saved to DB with ${productIndex.length} products`);
        return true;

    } catch (error) {
        console.error("[RAG] Failed to build index:", error.message);
        return false;
    }
};

const upsertProductEmbedding = async (productId) => {
    try {
        const product = await productModel.findById(productId);
        if (!product) {
            console.log(`[RAG] Product ${productId} not found`);
            return false;
        }

        const textContent = createTextContent(product);
        const tokens = tokenize(textContent);
        const tfidf = calculateTFIDF(tokens);

        await productEmbeddingModel.upsertEmbedding(productId, textContent, tfidf, tokens);

        const existingIdx = productIndex.findIndex(p => p.productId.toString() === productId.toString());
        const newEntry = {
            productId: product._id,
            name: product.name,
            description: product.description,
            category: product.category,
            subCategory: product.subCategory,
            price: product.price,
            image: product.image,
            bestseller: product.bestseller,
            tokens: tokens,
            tfidf: tfidf
        };

        if (existingIdx >= 0) {
            productIndex[existingIdx] = newEntry;
        } else {
            productIndex.push(newEntry);
        }

        console.log(`[RAG] Upserted embedding for product: ${product.name}`);
        return true;

    } catch (error) {
        console.error("[RAG] Failed to upsert embedding:", error.message);
        return false;
    }
};

const deleteProductEmbedding = async (productId) => {
    try {
        await productEmbeddingModel.deleteByProductId(productId);

        // Remove from in-memory index
        productIndex = productIndex.filter(p => p.productId.toString() !== productId.toString());

        console.log(`[RAG] Deleted embedding for product: ${productId}`);
        return true;

    } catch (error) {
        console.error("[RAG] Failed to delete embedding:", error.message);
        return false;
    }
};

/**
 * Search for similar products using TF-IDF
 */
const searchSimilar = async (query, topK = 5, filters = {}) => {
    try {
        if (!isIndexLoaded || productIndex.length === 0) {
            await loadIndexFromDB();
        }

        if (productIndex.length === 0) {
            return [];
        }

        const expandedQuery = expandQuery(query);
        const queryTokens = tokenize(expandedQuery);
        const queryTFIDF = calculateTFIDF(queryTokens);

        let results = productIndex.map(product => ({
            ...product,
            similarity: cosineSimilarity(queryTFIDF, product.tfidf)
        }));

        // Apply filters
        if (filters.maxPrice) {
            results = results.filter(p => p.price <= filters.maxPrice);
        }
        if (filters.category) {
            results = results.filter(p =>
                p.category.toLowerCase().includes(filters.category.toLowerCase()) ||
                p.subCategory.toLowerCase().includes(filters.category.toLowerCase())
            );
        }

        // Sort by similarity (with bestseller boost)
        results.sort((a, b) => {
            const aScore = a.similarity + (a.bestseller ? 0.1 : 0);
            const bScore = b.similarity + (b.bestseller ? 0.1 : 0);
            return bScore - aScore;
        });

        return results.slice(0, topK).map(({ tokens, tfidf, ...rest }) => rest);

    } catch (error) {
        console.error("[RAG] Search error:", error.message);
        return [];
    }
};

/**
 * Expand query with related terms for better matching
 */
const expandQuery = (query) => {
    const expansions = {
        'tiệc': 'tiệc vest sơ mi formal lịch sự sang trọng',
        'đám cưới': 'đám cưới vest sơ mi formal lịch sự sang trọng áo dài',
        'lạnh': 'lạnh khoác len sweater hoodie ấm mùa đông',
        'nóng': 'nóng thun ngắn tay mát mẻ mùa hè',
        'thể thao': 'thể thao gym chạy bộ thể dục athletic sportswear',
        'công sở': 'công sở văn phòng formal sơ mi quần tây lịch sự',
        'dạo phố': 'dạo phố casual đơn giản thoải mái streetwear',
        'hẹn hò': 'hẹn hò đẹp thời trang phong cách cuốn hút',
        'nam': 'nam men đàn ông',
        'nữ': 'nữ women phụ nữ',
    };

    let expanded = query.toLowerCase();
    Object.entries(expansions).forEach(([key, value]) => {
        if (expanded.includes(key)) {
            expanded += ' ' + value;
        }
    });

    return expanded;
};

/**
 * Get consultation response using RAG
 */
const getConsultation = async (userQuery, conversationHistory = []) => {
    try {
        // Extract price filter from query
        const priceMatch = userQuery.match(/dưới\s*(\d+)k?/i) || userQuery.match(/(\d+)k?\s*trở xuống/i);
        let maxPrice = null;
        if (priceMatch) {
            const num = parseInt(priceMatch[1]);
            maxPrice = num < 1000 ? num * 1000 : num;
        }

        const similarProducts = await searchSimilar(userQuery, 5, { maxPrice });

        if (similarProducts.length === 0) {
            return {
                success: false,
                message: "Xin lỗi, mình không tìm thấy sản phẩm phù hợp với yêu cầu của bạn. Bạn có thể mô tả cụ thể hơn được không?",
                products: []
            };
        }

        const productContext = similarProducts.map((p, i) =>
            `${i + 1}. ${p.name} - ${p.price.toLocaleString()}đ - ${p.category}/${p.subCategory}`
        ).join('\n');

        // Build conversation context
        let historyContext = "";
        if (conversationHistory.length > 0) {
            historyContext = "Lịch sử hội thoại gần đây:\n" +
                conversationHistory.map(m => `${m.role === 'user' ? 'Khách' : 'Trợ lý'}: ${m.content}`).join('\n') +
                "\n\n";
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
Bạn là AI tư vấn thời trang cho cửa hàng quần áo.
${historyContext}
Khách hàng hỏi: "${userQuery}"

Danh sách sản phẩm phù hợp:
${productContext}

Nhiệm vụ: Tư vấn ngắn gọn (2-3 câu) giải thích tại sao các sản phẩm này phù hợp với nhu cầu của khách.
Chỉ đề cập đến sản phẩm trong danh sách trên, không bịa thêm.
Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.
QUAN TRỌNG: KHÔNG sử dụng markdown (không dùng **, *, #, - hoặc bất kỳ ký tự định dạng nào). Chỉ trả lời bằng văn bản thuần túy.
`;

        const result = await model.generateContent(prompt);
        let consultation = result.response.text()
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/`/g, '')
            .trim();

        return {
            success: true,
            message: consultation,
            products: similarProducts.map(p => ({
                id: p.productId,
                name: p.name,
                price: p.price,
                image: p.image?.[0] || '',
                category: p.category,
                similarity: Math.round(p.similarity * 100)
            }))
        };

    } catch (error) {
        console.error("[RAG] Consultation error:", error.message);
        return {
            success: false,
            message: "Xin lỗi, có lỗi xảy ra khi tư vấn. Vui lòng thử lại.",
            products: []
        };
    }
};

/**
 * Get similar products using TF-IDF embeddings (item-item similarity)
 * @param {string} productId - The product to find similar items for
 * @param {number} topK - Number of results to return
 */
const getSimilarByEmbedding = async (productId, topK = 5) => {
    try {
        if (!isIndexLoaded || productIndex.length === 0) {
            await loadIndexFromDB();
        }

        // Find the source product in index
        const sourceProduct = productIndex.find(p => p.productId.toString() === productId.toString());

        if (!sourceProduct || !sourceProduct.tfidf) {
            console.log(`[RAG] Product ${productId} not found in index`);
            return [];
        }

        // Calculate similarity with all other products
        const similarities = productIndex
            .filter(p => p.productId.toString() !== productId.toString())
            .map(product => ({
                productId: product.productId,
                name: product.name,
                description: product.description,
                category: product.category,
                subCategory: product.subCategory,
                price: product.price,
                image: product.image,
                bestseller: product.bestseller,
                similarity: cosineSimilarity(sourceProduct.tfidf, product.tfidf)
            }));

        // Sort by similarity descending
        similarities.sort((a, b) => b.similarity - a.similarity);

        console.log(`[RAG] Found ${similarities.length} similar products for ${sourceProduct.name}`);

        return similarities.slice(0, topK);

    } catch (error) {
        console.error("[RAG] Similar by embedding error:", error.message);
        return [];
    }
};

/**
 * Refresh the product index
 */
const refreshIndex = async () => {
    isIndexLoaded = false;
    vocabulary = new Set();
    idfMap = {};
    return await buildProductIndex();
};

export {
    loadIndexFromDB,
    buildProductIndex,
    upsertProductEmbedding,
    deleteProductEmbedding,
    searchSimilar,
    getSimilarByEmbedding,
    getConsultation,
    refreshIndex
};
