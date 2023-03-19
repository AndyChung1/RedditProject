const mongoose = require('mongoose');
const {Schema} = mongoose;

const commentSchema = new mongoose.Schema({
    content: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
})

module.exports = mongoose.model('Comment', commentSchema);