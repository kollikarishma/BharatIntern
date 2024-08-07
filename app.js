const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blogDB', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Create a schema and model
const postSchema = new mongoose.Schema({
    title: String,
    content: String
});

const Post = mongoose.model('Post', postSchema);

// Set up body-parser and static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Home route
app.get('/', async (req, res) => {
    try {
        const posts = await Post.find({});
        res.render('index', { posts: posts });
    } catch (err) {
        next(err);
    }
});

// Specific post route
app.get('/post/:postId', async (req, res) => {
    const requestedPostId = req.params.postId;

    try {
        const post = await Post.findOne({ _id: requestedPostId });
        res.render('post', { post: post });
    } catch (err) {
        next(err);
    }
});

// Compose route
app.post('/compose', async (req, res) => {
    const postTitle = req.body.postTitle.trim();
    const postContent = req.body.postContent.trim();

    if (postTitle && postContent) {
        const post = new Post({
            title: postTitle,
            content: postContent
        });

        try {
            await post.save();
            res.redirect('/');
        } catch (err) {
            next(err);  
        }
    } else {
        res.status(400).send('Title and content are required');
    }
});

// Delete route
app.post('/delete/:postId', async (req, res) => {
    const postId = req.params.postId;

    try {
        await Post.findByIdAndDelete(postId);
        res.redirect('/');
    } catch (err) {
        res.status(500).send('Error deleting post');
    }
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
