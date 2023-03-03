const { default: mongoose, Schema } = require("mongoose");
const today = new Date();

const subredditSchema = new mongoose.Schema({
    name: String,
    description: String,
    dateCreated: {
        type: String,
        default: today.toDateString().split(' ').slice(1).join(' '),
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
    }]
});

const Subreddit = mongoose.model('Subreddit', subredditSchema);
module.exports = Subreddit;