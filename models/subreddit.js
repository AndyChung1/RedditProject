const { default: mongoose, Schema } = require("mongoose");
const {postSchema} = require('./post')

const subredditSchema = new mongoose.Schema({
    name: String,
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
    }]
});

const Subreddit = mongoose.model('Subreddit', subredditSchema);
module.exports = Subreddit;