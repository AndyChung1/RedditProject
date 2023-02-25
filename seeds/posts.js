const mongoose = require("mongoose");
const Post = require("../models/post");

mongoose.connect('mongodb://127.0.0.1:27017/reddit', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!");
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!");
        console.log(err);
    })


const seedPosts = [
    {
        title: 'This is my first post',
        content: 'I love reddit',
    },
    {
        title: 'This is pic of my dog',
        content: 'My dog loves food'
    },
    {
        title: 'This is lorem ipsum text',
        content: `Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                In repellendus aut cupiditate, cumque consequuntur, illum facere dignissimos
                doloremque tenetur perferendis reiciendis voluptate atque autem quod, possimus odio fugit dicta alias.`
    }
];

Post.insertMany(seedPosts)
    .then(res => {
        console.log(res)
    })
    .catch(e => {
        console.log(e)
    })