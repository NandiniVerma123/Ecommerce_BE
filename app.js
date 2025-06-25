const express = require('express');
const connectDB = require('./src/database/db');
const multer = require('multer');
const dotenv = require('dotenv');
const authenticate = require('./src/middlewares/authMiddleware')
const app = express()
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');



dotenv.config();

const whitelist = [
  'http://localhost:5173'
]


const corsOptions = {
  origin: (origin, callback) => {
      if(!origin) return callback(null, true);
      if(whitelist.includes(origin)){
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions));
app.use(express.json());



app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.use(async (req, res, next) => {
    if (req.path.startsWith('/auth')) {
      return next();
    }
    await authenticate(req, res, next);
  });

connectDB();

app.use('/auth', authRoutes);
app.use('/user', userRoutes);


app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})
