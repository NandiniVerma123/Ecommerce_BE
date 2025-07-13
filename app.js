const express = require('express');
const connectDB = require('./src/database/db');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Load env variables
dotenv.config();

const app = express();

const whitelist = ['http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Connect to database
connectDB();

// Routes
app.use('/auth', authRoutes);      // No auth needed
app.use('/user', userRoutes);      // Auth handled in route file
app.use('/admin', adminRoutes);    // Auth handled in route file

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});