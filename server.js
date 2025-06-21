const express = require('express');
const fs = require('fs-extra');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = './db.json';

app.use(cors());
app.use(express.json());

// GET all posts
app.get('/posts', (req, res) => {
  fs.readJSON(DB_FILE)
    .then(data => res.json(data.posts || []))
    .catch(err => {
      console.error('Error reading posts:', err);
      res.status(500).json({ error: 'Failed to read posts' });
    });
});

// GET one post by ID
app.get('/posts/:id', (req, res) => {
  fs.readJSON(DB_FILE)
    .then(data => {
      const post = (data.posts || []).find(p => p.id == req.params.id);
      post ? res.json(post) : res.status(404).json({ error: 'Post not found' });
    })
    .catch(err => {
      console.error('Error reading post:', err);
      res.status(500).json({ error: 'Failed to read post' });
    });
});

// POST new post
app.post('/posts', (req, res) => {
  fs.readJSON(DB_FILE)
    .then(data => {
      const posts = data.posts || [];
      const newPost = { id: Date.now(), ...req.body };
      posts.push(newPost);
      return fs.writeJSON(DB_FILE, { posts }).then(() => newPost);
    })
    .then(savedPost => res.status(201).json(savedPost))
    .catch(err => {
      console.error('Error saving post:', err);
      res.status(500).json({ error: 'Failed to save post' });
    });
});

// DELETE post
app.delete('/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  fs.readJSON(DB_FILE)
    .then(data => {
      let posts = data.posts || [];
      const index = posts.findIndex(p => p.id === id);
      if (index === -1) return res.status(404).json({ error: 'Post not found' });

      posts.splice(index, 1);
      return fs.writeJSON(DB_FILE, { posts }).then(() => res.status(204).end());
    })
    .catch(err => {
      console.error('Error deleting post:', err);
      res.status(500).json({ error: 'Failed to delete post' });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
