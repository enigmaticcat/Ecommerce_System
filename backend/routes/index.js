import authRouter from './auth'
import userRouter from './user'
import productRouter from './Product'
import categoryRouter from './category'
import orderRouter from './Order'
import paymentRouter from './payment'

const initRoutes = (app) => {
    app.use('/api/auth', authRouter)
    app.use('/api/user', userRouter)
    app.use('/api/product', productRouter)
    app.use('/api/category', categoryRouter)
    app.use('/api/order', orderRouter)
    app.use('/api/payment', paymentRouter)

    return app.use('/', (req, res) => {
        return res.send('SERVER ON')
    })
}

export default initRoutes
