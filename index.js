const postList = document.getElementById('posts-list'); // container for post titles
const newPostBtn = document.getElementById('new-post-btn');  // "Add new" button
const newPostForm = document.getElementById('new-post-form'); // the form container

//Select the form inputs
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const contentInput = document.getElementById('content');
const imageInput = document.getElementById('image');

const postContent = document.getElementById('post-content');

// Load posts on page load
const main = function () {
  fetch('http://localhost:3000/posts')
    .then(response => response.json())
    .then(posts => displayPosts(posts))
    .catch(error => console.error('Error fetching posts:', error));
};

main()

// Render post titles in the sidebar
function displayPosts(posts) {
  postList.innerHTML = '';

  posts.forEach(post => {
    const item = document.createElement('div');
    item.textContent = post.title;
    item.classList.add('post-item');
    item.addEventListener('click', () => handlePostClick(post.id));
    postList.appendChild(item);
  });

  // Display the first post on page load
  if (posts.length > 0) {
    handlePostClick(posts[0].id);
  }
}

//Render the selected posts on the main display area
function handlePostClick(id) {
  fetch(`http://localhost:3000/posts/${id}`)
    .then(response => response.json())    
    .then(post => {
      postContent.innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>By:</strong> ${post.author}</p>
        ${post.image ? `<img src="${post.image}" alt="${post.title}" style="max-width: 100%; margin: 1rem 0;">` : ''}
        <p>${post.content}</p>
        <button id="delete-btn" style="background-color: crimson; color: white; margin-top: 1rem;">Delete Post</button>
      `;

      // Attach delete functionality
      document.getElementById('delete-btn').addEventListener('click', () => deletePost(id));
    })
    .catch(error => {
      console.error('Error loading post:', error);
      postContent.innerHTML = `<p style="color: red;">Failed to load post.</p>`;
    });
}

// addNewPostListener function for adding form data and posting data to JSON server
const addNewPostListener = function (e) {
  e.preventDefault(); // Prevent form from reloading the page

  const newPost = {
    title: titleInput.value,
    author: authorInput.value,
    content: contentInput.value,
    image: imageInput.value
  };

  // Basic validation to ensure the user fills the recomended fields
  if (!newPost.title || !newPost.author || !newPost.content) {
    alert('Please fill in all required fields.');
    return;
  }

  // Send POST request to JSON Server
  fetch('http://localhost:3000/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPost)
  })
    .then(response => response.json())
    .then(data => {
      // Reset form
      newPostForm.reset();
      newPostForm.style.display = 'none';

      // Refresh post list
      main(); // Fetch posts again to include the new one
    })
    .catch(error => {
      console.error('Error submitting post:', error);
      alert('There was a problem saving your post.');
    });
}

//add the add new button functionality
newPostBtn.addEventListener('click', () => {
  const isVisible = newPostForm.style.display === 'block';
  newPostForm.style.display = isVisible ? 'none' : 'block';
});

//display the form to create and submit a new blog post
newPostForm.addEventListener('submit', addNewPostListener);

// Delete an individual displayed post
function deletePost(id) {
  const confirmed = confirm('Are you sure you want to delete this post?');

  if (!confirmed) return;

  fetch(`http://localhost:3000/posts/${id}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) throw new Error('Delete failed');
      // Refresh post list
      main();
      postContent.innerHTML = '<p>Post deleted.</p>';
    })
    .catch(error => {
      console.error('Error deleting post:', error);
      alert('Failed to delete the post.');
    });
}


