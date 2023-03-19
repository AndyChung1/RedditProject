const express = require('express');
const router = express.Router();
const {isLoggedIn, isAuthor} = require('../middleware');
const catchAsync = require('../utils/catchAsync');

const {Post} = require('../models/post');
const Subreddit = require('../models/subreddit');
const User = require('../models/user');
const ExpressError = require('../utils/expressError');
const comment = require('../models/comment');

router.get('/', catchAsync(async (req, res) => {
    const subreddits = await Subreddit.find();
    res.render('subreddits', {subreddits});
}));

router.post('/', catchAsync(async (req, res) => {
    if (!req.body) throw new ExpressError('Invalid subreddit data', 400);
    const {name, description} = req.body;
    const newSubreddit = new Subreddit({name, description})
    await newSubreddit.save()
    res.redirect('/subreddits')
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('subreddits/new')
})

router.delete('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Subreddit.findByIdAndDelete(id);
    res.redirect('/subreddits');
}));

router.get('/:subredditName', catchAsync(async (req, res) => {
    const {subredditName} = req.params;
    Subreddit.findOne({name: subredditName}).populate('posts').exec((err, subreddit) => {
        res.render('subreddits/show', {subreddit});
    })
}));

router.post('/:subredditName', catchAsync(async (req, res) => {
    if (!req.body) throw new ExpressError('Invalid post data', 400);
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
}));

router.get('/:subredditName/new', isLoggedIn, catchAsync(async (req, res) => {
    const {subredditName} = req.params;
    const subreddit = await Subreddit.findOne({name: subredditName})
    res.render('posts/new', {subreddit})
}));

router.get('/:subredditName/:id', catchAsync(async (req, res) => {
    const {id, subredditName} = req.params;
    const subreddit = await Subreddit.findOne({name: subredditName})
    const post = await Post.findById(id)
    const authorId = post.author;
    const author = await User.findById(authorId);
    console.log(author.username)
    Post.findById(id).populate('comments').exec((err, post) => {
        res.render('posts/show', {post, subreddit, author});
    })
    // res.render('posts/show', {post, subreddit, author})
}));

router.post('/:subredditName/:id/comment', catchAsync(async (req, res) => {
    const {id} = req.params;
    const {content} = req.body;
    const currentUser = req.user;
    const post = await Post.findById(id);
    const newComment = new comment({content, currentUser});
    console.log(newComment.content);
    post.comments.push(newComment);
    await post.save();
    await newComment.save();
    res.redirect(req.get('referer'));
}))

router.get('/:subredditName/:id/edit', isAuthor, catchAsync(async (req, res) => {
    const {subredditName, id} = req.params;
    const subreddit = await Subreddit.findOne({name: subredditName})
    const post = await Post.findById(id);
    res.render('posts/edit', {post, subreddit})
}));

router.put('/:subredditName/:id', catchAsync(async (req, res) => {
    if (!req.body) throw new ExpressError('Invalid post data', 400);
    const {subredditName, id} = req.params;
    const post = await Post.findByIdAndUpdate(id, req.body);
    await post.save();
    res.redirect(`/subreddits/${subredditName}/${id}`)
}));

router.delete('/:subredditName/:id', isAuthor, catchAsync(async (req, res) => {
    const {subredditName, id} = req.params;
    await Post.findByIdAndDelete(id);
    res.redirect(`/subreddits/${subredditName}`);
}));

module.exports = router;