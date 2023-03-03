const {Post} = require('./models/post')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first');
        return res.redirect(req.get('referer'));
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    if ((!req.user) || (!post.author.equals(req.user._id))) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(req.get('referer'));
    }
    next();
}
