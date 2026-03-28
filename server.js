const express = require('express');
const path = require('path');
require('dotenv').config();

const uploadRoute = require('./routes/upload');
const authRoute = require('./routes/auth');
const filesRoute = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/', uploadRoute);
app.use('/auth', authRoute);
app.use('/', filesRoute);

const db = require('./config/db');

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});