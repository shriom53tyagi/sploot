/** Dotenv Environment Variables */
if (process.env.HEROKU_DEPLOYMENT !== 'true') {
    require('dotenv').config();
}
/** Connect to MongoDB */
require('./db/mongoose');

/** Built In Node Dependencies */
const path = require('path');
/** Express */
const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);

/** Routes */
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const articleRoutes = require('./routes/article');
const middleware = require('./middleware/verfiyToken');
/** Routes */

app.use(express.static(path.join(__dirname,"../client/build")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cors());

/** Routes Definitions */
app.use('/api', authRoutes);
/** Middleware */

app.all('*', middleware.verifyJWT)

app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);


/** Serve static assets if production */
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, '../client', 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
}

if (process.env.NODE_ENV !== 'test') {
    server.listen(process.env.PORT || 3001, () => {
        console.info(`[LOG=SERVER] Server started on port ${process.env.PORT}`);
    });
}

module.exports = { app };
