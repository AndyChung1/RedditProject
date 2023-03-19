const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const session = require('express-session');
const path = require('path');
const engine = require('ejs-mate')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash')

const Subreddit = require('./models/subreddit');
const User = require('./models/user');

const subredditRoutes = require('./routes/subreddits');
const userRoutes = require('./routes/user');

const expressError = require('./utils/expressError');

mongoose.connect('mongodb://127.0.0.1:27017/reddit', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', engine)

app.use(express.urlencoded(extended = true))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.allSubreddits = await Subreddit.find();
    console.log(req.isAuthenticated())
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/subreddits', subredditRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new expressError('Page not found', 404));
});

app.use((err, req, res, next) => {
    const {statusCode = 500, message = 'Something went wrong'} = err;
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
});