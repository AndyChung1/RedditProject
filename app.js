const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const path = require('path');
const {Post} = require('./models/post');
const Subreddit = require('./models/subreddit');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/reddit', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database connected');
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded(extended = true))
app.use(methodOverride('_method'));

app.get('/', (req,res) => {
    res.render('home');
});

app.get('/subreddits', async (req, res) => {
    const subreddits = await Subreddit.find();
    res.render('subreddits', {subreddits});
});

app.post('/subreddits', async (req, res) => {
    const {name} = req.body;
    const newSubreddit = new Subreddit({name})
    await newSubreddit.save()
    res.redirect('/subreddits')
})

app.get('/subreddits/new', (req, res) => {
    res.render('subreddits/new')
})

app.delete('/subreddits/:id', async (req, res) => {
    const {id} = req.params;
    await Subreddit.findByIdAndDelete(id);
    res.redirect('/subreddits');
})

app.get('/subreddits/:subredditName', async (req, res) => {
    const {subredditName} = req.params;
    Subreddit.findOne({name: subredditName}).populate('posts').exec((err, subreddit) => {
        if (err) {
            console.error(err);
            return;
        }
        res.render('subreddits/show', {subreddit});
    })
})

app.post('/subreddits/:subredditName', async (req, res) => {
    const {subredditName} = req.params;
    const subreddit = await Subreddit.findOne({name: subredditName});
    const {title, content} = req.body;
    const newPost = new Post({title, content});
    subreddit.posts.push(newPost);
    newPost.subreddit = subreddit
    await newPost.save()
    await subreddit.save()
    res.redirect(`/subreddits/${subredditName}`)
})

app.get('/subreddits/:subredditName/new', async (req, res) => {
    const {subredditName} = req.params;
    const subreddit = await Subreddit.findOne({name: subredditName})
    res.render('posts/new', {subreddit})
})

app.get('/subreddits/:subredditName/:id', async (req, res) => {
    const {id, subredditName} = req.params;
    const subreddit = await Subreddit.findOne({name: subredditName})
    const post = await Post.findById(id)
    res.render('posts/show', {post, subreddit})
})

app.get('/subreddits/:subredditName/:id/edit', async (req, res) => {
    const {subredditName, id} = req.params;
    const subreddit = await Subreddit.findOne({name: subredditName})
    const post = await Post.findById(id);
    res.render('posts/edit', {post, subreddit})
})

app.put('/subreddits/:subredditName/:id', async (req, res) => {
    const {subredditName, id} = req.params;
    const post = await Post.findByIdAndUpdate(id, req.body.post);
    res.redirect(`/subreddits/${subredditName}/${id}`)
})

app.delete('/subreddits/:subredditName/:id', async (req, res) => {
    const {subredditName, id} = req.params;
    await Post.findByIdAndDelete(id);
    res.redirect(`/subreddits/${subredditName}`);
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
});