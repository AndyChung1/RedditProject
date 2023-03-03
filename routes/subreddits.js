const express = require('express');
const router = express.Router();
const {isLoggedIn, isAuthor} = require('../middleware')

const {Post} = require('../models/post');
const Subreddit = require('../models/subreddit');
const User = require('../models/user')

router.get('/', async (req, res) => {
    const subreddits = await Subreddit.find();
    res.render('subreddits', {subreddits});
});

router.post('/', async (req, res) => {
    const {name, description} = req.body;
    const newSubreddit = new Subreddit({name, description})
    await newSubreddit.save()
    res.redirect('/subreddits')
})

router.get('/new', isLoggedIn, (req, res) => {
    res.render('subreddits/new')
})

router.delete('/:id', async (req, res) => {
    const {id} = req.params;
    await Subreddit.findByIdAndDelete(id);
    res.redirect('/subreddits');
})

router.get('/:subredditName', async (req, res) => {
    const {subredditName} = req.params;
    Subreddit.findOne({name: subredditName}).populate('posts').exec((err, subreddit) => {
        if (err) {
            console.error(err);
            return;
        }
        res.render('subreddits/show', {subreddit});
    })
})

router.post('/:subredditName', async (req, res) => {
    const {subredditName} = req.params;
    const {title, content} = req.body;
    const currentUser = req.user
    const subreddit = await Subreddit.findOne({name: subredditName});
    const newPost = new Post({title, content});
    subreddit.posts.push(newPost);
    newPost.author = currentUser;
    newPost.subreddit = subreddit
    await newPost.save()
    await subreddit.save()
    res.redirect(`/subreddits/${subredditName}`)
})

router.get('/:subredditName/new', isLoggedIn, async (req, res) => {
    const {subredditName} = req.params;
    const subreddit = await Subreddit.findOne({name: subredditName})
    res.render('posts/new', {subreddit})
})

router.get('/:subredditName/:id', async (req, res) => {
    const {id, subredditName} = req.params;
    const subreddit = await Subreddit.findOne({name: subredditName})
    const post = await Post.findById(id)
    const authorId = post.author;
    const author = await User.findById(authorId);
    res.render('posts/show', {post, subreddit, author})
})

router.get('/:subredditName/:id/edit', isAuthor, async (req, res) => {
    const {subredditName, id} = req.params;
    const subreddit = await Subreddit.findOne({name: subredditName})
    const post = await Post.findById(id);
    res.render('posts/edit', {post, subreddit})
})

router.put('/:subredditName/:id', async (req, res) => {
    const {subredditName, id} = req.params;
    const post = await Post.findByIdAndUpdate(id, req.body.post);
    res.redirect(`/subreddits/${subredditName}/${id}`)
})

router.delete('/:subredditName/:id', async (req, res) => {
    const {subredditName, id} = req.params;
    await Post.findByIdAndDelete(id);
    res.redirect(`/subreddits/${subredditName}`);
})

module.exports = router;