import express from 'express';
require("dotenv").config()
import cors from 'cors'
import initRoutes from './src/routes';
import connectDB from './src/config/connectDB';

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')