const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDb = require('./config/dbConnection');
const errorHandler = require('./middleware/errorHandler');
const dotenv = require('dotenv').config();

connectDb();
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/profiles', express.static(path.join(__dirname, 'public', 'profiles')));
app.use('/backgrounds', express.static(path.join(__dirname, 'public', 'backgrounds')));
app.use('/links', express.static(path.join(__dirname, 'public', 'links')));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/links', require('./routes/linkRoutes'));
app.use('/api/stats', require('./routes/statRoutes'));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
