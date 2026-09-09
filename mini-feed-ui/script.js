"use strict";

// ===== Data layer =====
// Carried over from the simulator. Nothing in this section touches the
// page; it only manages the feed array. The DOM code lower down calls
// into it and then re-renders.

const feed = [];
let nextId = 1;

// Build the post, stamp it with an id and a timestamp, start it at
// zero likes, then push it onto the feed.
function createPost(username, content, imageUrl) {
  const post = {
    id: nextId,
    username: username,
    content: content,
    likes: 0,
    imageUrl: imageUrl,
    timestamp: Date.now() + nextId, 
    //back-to-back posts can land on the same millisecond, adding the id keeps every timestamp unique
  };
  nextId++;
  feed.push(post);
  return post;
}

// Track down the post by id and bump its likes. Hand back null if the
// id doesn't exist.
function likePost(postId) {
  const post = feed.find((p) => p.id === postId);
  if (!post) return null;
  post.likes++;
  return post;
}

// Pull the post out of the feed array by id. splice returns what it
// removed, so the caller gets the deleted post back.
function deletePost(postId) {
  const index = feed.findIndex((p) => p.id === postId);
  if (index === -1) return null;
  return feed.splice(index, 1)[0];
}

// Newest first. The spread makes a copy so I'm sorting the copy,
// not scrambling the real feed.
function sortByNewest() {
  return [...feed].sort((a, b) => b.timestamp - a.timestamp);
}

// Most likes first. Same deal, sort the copy, leave the feed alone.
function sortByLikes() {
  return [...feed].sort((a, b) => b.likes - a.likes);
}

// Just one user's posts. Filter keeps the ones whose username contains
// the search text (case-insensitive) and drops the rest. Takes a list
// instead of reading the feed directly so it can run on an already
// sorted copy.
function getPostsByUser(posts, search) {
  const needle = search.toLowerCase();
  return posts.filter((post) => post.username.toLowerCase().includes(needle));
}

// Hand back the whole feed as is.
function getFeed() {
  return feed;
}

// ===== UI layer =====
// Everything below reads inputs, builds elements, and repaints the
// page. It never touches the feed array directly, it goes through the
// functions above.

const postForm = document.querySelector("#postForm");
const usernameInput = document.querySelector("#usernameInput");
const contentInput = document.querySelector("#contentInput");
const imageInput = document.querySelector("#imageInput");
const sortSelect = document.querySelector("#sortSelect");
const filterInput = document.querySelector("#filterInput");
const feedContainer = document.querySelector("#feedContainer");
const emptyMessage = document.querySelector("#emptyMessage");

// Turn one post object into one card element. Builds and returns it,
// doesn't put it on the page, that's renderFeed's job.
function createPostCard(post) {
  const card = document.createElement("article");
  card.classList.add("post");

  const user = document.createElement("p");
  user.classList.add("post-user");
  user.textContent = `@${post.username}`;

  const content = document.createElement("p");
  content.classList.add("post-content");
  content.textContent = post.content;

  const likeBtn = document.createElement("button");
  likeBtn.classList.add("like-btn");
  likeBtn.dataset.id = post.id; // the button remembers which post it belongs to
  likeBtn.textContent = `Like (${post.likes})`;

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.dataset.id = post.id;
  deleteBtn.textContent = "Delete";

  const actions = document.createElement("div");
  actions.classList.add("post-actions");
  actions.append(likeBtn, deleteBtn);

  // The image is optional, so the card's shape depends on the data:
  // only build an img element when the post actually has a URL.
  if (post.imageUrl !== "") {
    const image = document.createElement("img");
    image.src = post.imageUrl;
    image.alt = `Image posted by ${post.username}`;
    image.classList.add("post-image");
    card.append(user, content, image, actions);
  } else {
    card.append(user, content, actions);
  }

  return card;
}

// Wipe the feed display and rebuild it from the data: sort per the
// dropdown, filter per the search box, one card per post. Runs after
// every change so the page always matches the array.
function renderFeed() {
  feedContainer.innerHTML = "";

  let posts = sortSelect.value === "likes" ? sortByLikes() : sortByNewest();

  const search = filterInput.value.trim();
  if (search !== "") {
    posts = getPostsByUser(posts, search);
  }

  // Two different empty states: a truly empty feed, or a filter that
  // matched nothing.
  emptyMessage.textContent =
    getFeed().length === 0 ? "No posts yet." : "No posts match that username.";
  emptyMessage.hidden = posts.length > 0;

  posts.forEach((post) => feedContainer.appendChild(createPostCard(post)));
}

// Submit covers the button click AND pressing Enter in the form.
// preventDefault stops the browser's default full page reload.
postForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const imageUrl = imageInput.value.trim();
  const username = usernameInput.value.trim();
  const content = contentInput.value.trim();
  if (username === "" || content === "") return;

  createPost(username, content, imageUrl);
  postForm.reset();
  usernameInput.focus();
  renderFeed();
});

// One listener on the container handles Like and Delete for every
// card, including ones rendered later. The data-id on the clicked
// button says which post to act on.
feedContainer.addEventListener("click", (event) => {
  const id = Number(event.target.dataset.id);

  if (event.target.classList.contains("like-btn")) {
    likePost(id);
    renderFeed();
  } else if (event.target.classList.contains("delete-btn")) {
    deletePost(id);
    renderFeed();
  }
});

// Any change to the sort or the filter just repaints the feed.
sortSelect.addEventListener("change", renderFeed);
filterInput.addEventListener("input", renderFeed);

// ===== Demo seed =====
// A few posts so the page isn't blank on load, same crew as the
// simulator's demo run.

createPost("bishara", "Hello world", "");
createPost("paul", "Learning JavaScript is fun", "");
createPost("chris", "Shipping the mini feed UI", "https://picsum.photos/400/200");

likePost(1);
likePost(1);
likePost(3);
likePost(3);
likePost(3);
likePost(2);

renderFeed();
