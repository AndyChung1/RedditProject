const mongoose = require('mongoose');
const {Schema} = mongoose;

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    subreddit: {
        type: Schema.Types.ObjectId,
        ref: 'Subreddit',
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
});

const Post = mongoose.model('Post', postSchema);
module.exports = {Post, postSchema};