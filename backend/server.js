import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import user from './routes/user.js'
import product from './routes/Product.js'
import cart from './routes/cart.js'
import Order from './routes/Order.js'
import coupon from './routes/coupon.js'
import vnpay from './routes/vnpay.js'
import chatbot from './routes/chatbot.js'
import category from './routes/category.js'
import recommendation from './routes/recommendation.js'
import { loadIndexFromDB } from './services/ragService.js'

//App Config
const app = express()
const port = process.env.PORT || 4000

// Initialize connections
const initializeServer = async () => {
    await connectDB()
    await connectCloudinary()

    // Load RAG product index from DB after DB connection
    console.log('[Server] Loading RAG product index from database...')
    loadIndexFromDB().then(() => {
        console.log('[Server] RAG product index ready')
    }).catch(err => {
        console.error('[Server] RAG index load failed:', err.message)
    })
}

initializeServer()

//Middleware
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/user', user)
app.use('/api/product', product)
app.use('/api/cart', cart)
app.use('/api/order', Order)
app.use('/api/coupon', coupon)
app.use('/api/vnpay', vnpay)
app.use('/api/chatbot', chatbot)
app.use('/api/category', category)
app.use('/api/recommendation', recommendation)

app.get('/', (req, res) => {
    res.send("API Working")
})

app.listen(port, () => console.log('Server started on PORT : ' + port))