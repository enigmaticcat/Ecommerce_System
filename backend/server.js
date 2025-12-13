import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import initRoutes from "./routes/index.js";
import db from "./models";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

initRoutes(app);

// Connect to Database
db.sequelize.authenticate()
  .then(() => {
    console.log('Connection to PostgreSQL has been established successfully.');
    // Sync models (CAUTION: force: true will drop tables)
    // For dev, we can use alter: true or nothing if we want to preserve data
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });