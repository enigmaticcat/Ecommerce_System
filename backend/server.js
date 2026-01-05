import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import user from './routes/user.js'
import product from './routes/product.js'
import cart from './routes/cart.js'
import Order from './routes/Order.js'
import coupon from './routes/coupon.js'
import vnpay from './routes/vnpay.js'
import chatbot from './routes/chatbot.js'
import category from './routes/category.js'

//App Config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

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

app.get('/', (req, res) => {
    res.send("API Working")
})

app.listen(port, () => console.log('Server started on PORT : ' + port))