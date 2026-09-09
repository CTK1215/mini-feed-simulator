"use strict";

// ===== Data layer =====

const feed = [];
let nextId = 1;
let nextCommentId = 1;

function createPost(username, content, media) {
  const post = {
    id: nextId,
    username: username,
    content: content,
    likes: 0,
    media: media,
    comments: [],
    timestamp: Date.now() + nextId, // two posts can share a millisecond; the id keeps timestamps unique
  };
  nextId++;
  feed.push(post);
  return post;
}

function likePost(postId) {
  const post = feed.find((p) => p.id === postId);
  if (!post) return null;
  post.likes++;
  return post;
}

function deletePost(postId) {
  const index = feed.findIndex((p) => p.id === postId);
  if (index === -1) return null;
  return feed.splice(index, 1)[0];
}

function addComment(postId, username, text) {
  const post = feed.find((p) => p.id === postId);
  if (!post) return null;

  const comment = {
    id: nextCommentId,
    username: username,
    text: text,
    timestamp: Date.now() + nextCommentId,
  };
  nextCommentId++;
  post.comments.push(comment);
  return comment;
}

function sortByNewest() {
  return [...feed].sort((a, b) => b.timestamp - a.timestamp);
}

function sortByLikes() {
  return [...feed].sort((a, b) => b.likes - a.likes);
}

function getPostsByUser(posts, search) {
  const needle = search.toLowerCase();
  return posts.filter((post) => post.username.toLowerCase().includes(needle));
}

function getFeed() {
  return feed;
}

// ----- persistence -----

const STORAGE_KEY = "mini-feed";

function saveFeed() {
  const data = { feed: feed, nextId: nextId, nextCommentId: nextCommentId };
  // blob: URLs only live while the page is open, so they're saved as null
  // and the card shows a "not saved" chip after a reload.
  const json = JSON.stringify(data, (key, value) =>
    key === "url" && typeof value === "string" && value.startsWith("blob:")
      ? null
      : value
  );
  try {
    localStorage.setItem(STORAGE_KEY, json);
    return true;
  } catch (error) {
    return false; // QuotaExceededError, localStorage caps near 5 MB
  }
}

function loadFeed() {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return false;

  const data = JSON.parse(json);
  feed.length = 0; // feed is a const, so empty it in place instead of reassigning
  feed.push(...data.feed);
  nextId = data.nextId;
  nextCommentId = data.nextCommentId;
  return true;
}

// ===== UI layer =====

const postForm = document.querySelector("#postForm");
const usernameInput = document.querySelector("#usernameInput");
const contentInput = document.querySelector("#contentInput");
const imageFile = document.querySelector("#imageFile");
const videoFile = document.querySelector("#videoFile");
const anyFile = document.querySelector("#anyFile");
const attachName = document.querySelector("#attachName");
const saveStatus = document.querySelector("#saveStatus");
const sortSelect = document.querySelector("#sortSelect");
const filterInput = document.querySelector("#filterInput");
const feedContainer = document.querySelector("#feedContainer");
const emptyMessage = document.querySelector("#emptyMessage");
const themeToggle = document.querySelector("#themeToggle");

const filePickers = [imageFile, videoFile, anyFile];

// Files up to this size are saved as data URLs. Base64 adds a third on
// top and the whole store caps near 5 MB, so bigger files stay session-only.
const MAX_SAVED_BYTES = 1024 * 1024;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// FileReader is callback-based; wrapping it in a Promise lets callers await it.
function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function mediaFromFile(file) {
  let kind = "file";
  if (file.type.startsWith("image/")) kind = "image";
  else if (file.type.startsWith("video/")) kind = "video";

  // Small files become a data URL (text, survives a reload). Big files get
  // a blob: URL that dies with the page.
  const url =
    file.size <= MAX_SAVED_BYTES
      ? await readAsDataUrl(file)
      : URL.createObjectURL(file);

  return { kind: kind, url: url, name: file.name, size: file.size };
}

function createMediaElement(post) {
  const media = post.media;

  if (media.url === null) {
    const lost = document.createElement("span");
    lost.classList.add("post-file", "lost");
    lost.textContent = `${media.name} (${formatSize(media.size)}) was too large to save`;
    return lost;
  }

  if (media.kind === "image") {
    const image = document.createElement("img");
    image.src = media.url;
    image.alt = `Image posted by ${post.username}`;
    image.classList.add("post-image");
    return image;
  }

  if (media.kind === "video") {
    const video = document.createElement("video");
    video.src = media.url;
    video.controls = true;
    video.classList.add("post-video");
    return video;
  }

  const link = document.createElement("a");
  link.href = media.url;
  link.download = media.name;
  link.classList.add("post-file");
  link.textContent = `${media.name} (${formatSize(media.size)})`;
  return link;
}

function createCommentsSection(post) {
  const wrapper = document.createElement("div");

  const list = document.createElement("ul");
  list.classList.add("comments");
  post.comments.forEach((comment) => {
    const item = document.createElement("li");
    item.classList.add("comment");

    const user = document.createElement("span");
    user.classList.add("comment-user");
    user.textContent = `@${comment.username} `;

    const text = document.createElement("span");
    text.textContent = comment.text;

    const when = document.createElement("time");
    when.classList.add("comment-time");
    when.dateTime = new Date(comment.timestamp).toISOString();
    when.textContent = new Date(comment.timestamp).toLocaleTimeString();

    item.append(user, text, when);
    list.appendChild(item);
  });

  // innerHTML is safe here because this markup is fixed. User text never
  // goes through innerHTML, only textContent.
  const form = document.createElement("form");
  form.classList.add("comment-form");
  form.dataset.id = post.id;
  form.innerHTML = `
    <input name="username" placeholder="Name">
    <input name="text" placeholder="Write a comment">
    <button type="submit">Add</button>
  `;

  if (post.comments.length > 0) wrapper.appendChild(list);
  wrapper.appendChild(form);
  return wrapper;
}

function createPostCard(post) {
  const card = document.createElement("article");
  card.classList.add("post");

  const user = document.createElement("p");
  user.classList.add("post-user");
  user.textContent = `@${post.username}`;

  const when = document.createElement("time");
  when.classList.add("post-time");
  when.dateTime = new Date(post.timestamp).toISOString();
  when.textContent = new Date(post.timestamp).toLocaleString();

  const content = document.createElement("p");
  content.classList.add("post-content");
  content.textContent = post.content;

  const likeBtn = document.createElement("button");
  likeBtn.classList.add("like-btn");
  likeBtn.dataset.id = post.id;
  likeBtn.textContent = `Like (${post.likes})`;

  const shareBtn = document.createElement("button");
  shareBtn.classList.add("share-btn");
  shareBtn.dataset.id = post.id;
  shareBtn.textContent = "Share";

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.dataset.id = post.id;
  deleteBtn.textContent = "Delete";

  const actions = document.createElement("div");
  actions.classList.add("post-actions");
  actions.append(likeBtn, shareBtn);

  // Download is an anchor because the `download` attribute is what makes a
  // browser save instead of navigate. Cross-origin URLs (the seed image)
  // ignore it and just open in a tab.
  const hasMedia = post.media && post.media.url !== null;
  if (hasMedia && post.media.kind !== "file") {
    const downloadBtn = document.createElement("a");
    downloadBtn.classList.add("download-btn");
    downloadBtn.href = post.media.url;
    downloadBtn.download = post.media.name || "";
    downloadBtn.textContent = "Download";
    actions.appendChild(downloadBtn);
  }

  actions.appendChild(deleteBtn);

  if (post.media) {
    card.append(user, when, content, createMediaElement(post), actions);
  } else {
    card.append(user, when, content, actions);
  }

  card.appendChild(createCommentsSection(post));
  return card;
}

function renderFeed() {
  feedContainer.innerHTML = "";

  let posts = sortSelect.value === "likes" ? sortByLikes() : sortByNewest();

  const search = filterInput.value.trim();
  if (search !== "") {
    posts = getPostsByUser(posts, search);
  }

  emptyMessage.textContent =
    getFeed().length === 0 ? "No posts yet." : "No posts match that username.";
  emptyMessage.hidden = posts.length > 0;

  posts.forEach((post) => feedContainer.appendChild(createPostCard(post)));
}

// Every data change goes through here so nothing gets rendered without being saved.
function update() {
  const saved = saveFeed();
  saveStatus.textContent = saved
    ? ""
    : "Couldn't save: browser storage is full. Delete a post with media to free space.";
  saveStatus.hidden = saved;
  renderFeed();
}

function getPickedFile() {
  const picker = filePickers.find((input) => input.files.length > 0);
  return picker ? picker.files[0] : null;
}

function showAttachName() {
  const file = getPickedFile();
  attachName.textContent = file ? `Attached: ${file.name}` : "";
  attachName.hidden = !file;
}

async function sharePost(post, button) {
  const text = `@${post.username}: ${post.content}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: "Mini Feed", text: text });
    } catch (error) {
      // User closed the share sheet.
    }
    return;
  }

  await navigator.clipboard.writeText(text);
  button.textContent = "Copied";
  setTimeout(() => {
    button.textContent = "Share";
  }, 1500);
}

// async so a picked file can be read without freezing the page.
postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim();
  const content = contentInput.value.trim();
  if (username === "" || content === "") return;

  const file = getPickedFile();
  const media = file ? await mediaFromFile(file) : null;

  createPost(username, content, media);
  postForm.reset();
  showAttachName();
  usernameInput.focus();
  update();
});

// One listener on the container covers every card, including ones rendered later.
feedContainer.addEventListener("click", (event) => {
  const id = Number(event.target.dataset.id);

  if (event.target.classList.contains("like-btn")) {
    likePost(id);
    update();
  } else if (event.target.classList.contains("share-btn")) {
    const post = getFeed().find((p) => p.id === id);
    if (post) sharePost(post, event.target);
  } else if (event.target.classList.contains("delete-btn")) {
    const removed = deletePost(id);
    // A blob: URL holds the file in memory until it's released.
    if (removed && removed.media && removed.media.url && removed.media.url.startsWith("blob:")) {
      URL.revokeObjectURL(removed.media.url);
    }
    update();
  }
});

// Submit events bubble like clicks, so this catches every comment form.
feedContainer.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const id = Number(form.dataset.id);
  const username = form.elements.username.value.trim();
  const text = form.elements.text.value.trim();
  if (username === "" || text === "") return;

  addComment(id, username, text);
  update();
});

// One attachment per post: picking in one picker clears the other two.
filePickers.forEach((picker) => {
  picker.addEventListener("change", () => {
    filePickers.forEach((other) => {
      if (other !== picker) other.value = "";
    });
    showAttachName();
  });
});

sortSelect.addEventListener("change", renderFeed);
filterInput.addEventListener("input", renderFeed);

// ----- theme -----

const THEME_KEY = "mini-feed-theme";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  applyTheme(current === "dark" ? "light" : "dark");
});

// First visit follows the system setting; after that, the saved choice.
const savedTheme = localStorage.getItem(THEME_KEY);
const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(savedTheme || (systemDark ? "dark" : "light"));

// ===== Startup =====

// The demo seed only runs when nothing has been saved yet.
if (!loadFeed()) {
  createPost("bishara", "Hello world", null);
  createPost("paul", "Learning JavaScript is fun", null);
  createPost("chris", "Shipping the mini feed UI", {
    kind: "image",
    url: "https://picsum.photos/400/200",
    name: "",
    size: 0,
  });

  likePost(1);
  likePost(1);
  likePost(3);
  likePost(3);
  likePost(3);
  likePost(2);

  addComment(1, "paul", "Welcome aboard");
  saveFeed();
}

renderFeed();
