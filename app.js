const express = require('express');
const connectDB = require('./src/database/db');
const dotenv = require('dotenv');
const multer = require('multer');

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
