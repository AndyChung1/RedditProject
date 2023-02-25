const mongoose = require("mongoose");
const Post = require("../models/post");
const Subreddit = require("../models/subreddit");

mongoose.connect('mongodb://127.0.0.1:27017/reddit', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!");
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!");
        console.log(err);
    })

const seedSubreddits = [
    {
        name: 'dogs',
    },
    {
        name: 'cats',
    },
    {
        name: 'makemesuffer',
    }
];

const seedDb = async () => {
    const subreddits = await Subreddit.find()
    console.log(subreddits)
    await Subreddit.deleteMany({})
    Subreddit.insertMany(seedSubreddits)
    .then(res => {
        console.log(res)
    })
    .catch(e => {
        console.log(e)
    })
}

seedDb()