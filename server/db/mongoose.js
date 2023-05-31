const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const connect = () => {
    mongoose.connect(
        process.env.DATABASE_URL,
        { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
        err => {
            if (err) {
                console.error(err);
                return;
            }

            if (process.env.NODE_ENV !== 'test') {
                console.info('[LOG=DB] Successfully connected to MongoDB');
            }
        }
    );
};

connect();

module.exports = { mongoose, connect };
