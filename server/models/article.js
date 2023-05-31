const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ArticleSchema = new Schema(
    {
        title: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        user_id: {
            type: String,
            trim: true
        },
        html: {
            type: String,
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

const Article = mongoose.model('article', ArticleSchema);

module.exports = { Article };
