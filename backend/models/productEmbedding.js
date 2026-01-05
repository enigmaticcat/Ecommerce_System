import mongoose from "mongoose";

const productEmbeddingSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
        unique: true,
        index: true
    },
    textContent: {
        type: String,
        required: true
    },
    // Store TF-IDF vector as a Map for efficient storage
    tfidfVector: {
        type: Map,
        of: Number,
        default: new Map()
    },
    // Cache tokenized text for faster search
    tokens: [{
        type: String
    }]
}, {
    timestamps: true
});

// Static method to get all embeddings for RAG
productEmbeddingSchema.statics.getAllEmbeddings = async function () {
    return await this.find({}).lean();
};

// Static method to update or create embedding
productEmbeddingSchema.statics.upsertEmbedding = async function (productId, textContent, tfidfVector, tokens) {
    return await this.findOneAndUpdate(
        { productId },
        {
            productId,
            textContent,
            tfidfVector: Object.fromEntries(Object.entries(tfidfVector)),
            tokens,
            updatedAt: new Date()
        },
        { upsert: true, new: true }
    );
};

// Static method to delete embedding
productEmbeddingSchema.statics.deleteByProductId = async function (productId) {
    return await this.deleteOne({ productId });
};

const productEmbeddingModel = mongoose.models.productEmbedding ||
    mongoose.model('productEmbedding', productEmbeddingSchema);

export default productEmbeddingModel;
