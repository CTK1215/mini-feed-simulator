// Mini Feed Simulator
// The data side of a social feed. No browser, no DOM, just plain
// JavaScript in Node so the focus stays on arrays and objects.

const feed = [];
let nextId = 1;

// Build the post, stamp it with an id and a timestamp, start it at
// zero likes, then push it onto the feed.
function createPost(username, content) {
  const post = {
    id: nextId,
    username: username,
    content: content,
    likes: 0,
    timestamp: Date.now() + nextId, // back-to-back posts can land on the same millisecond, adding the id keeps every timestamp unique
  };
  nextId++;
  feed.push(post);
  return post;
}

// Track down the post by id and bump its likes. If the id doesn't
// exist, say so and hand back null instead of crashing.
function likePost(postId) {
  const post = feed.find((p) => p.id === postId);
  if (!post) {
    console.log(`No post found with id ${postId}`);
    return null;
  }
  post.likes++;
  return post;
}

// Hand back the whole feed as is.
function getFeed() {
  return feed;
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

// Just one user's posts. Filter keeps the ones that match and
// drops the rest.
function getPostsByUser(username) {
  return feed.filter((post) => post.username === username);
}

// Turn post objects into readable one-liners for the console.
function formatPosts(posts) {
  return posts.map(
    (post) => `#${post.id} @${post.username}: "${post.content}" (${post.likes} likes)`
  );
}

// --- Demo run ---

// Seed a few posts, spread some likes around, then print the feed
// every way it can be sliced. Last call proves the bad-id guard works.
createPost("alex", "Hello world");
createPost("paul", "Learning JavaScript is fun");
createPost("chris", "Shipping the mini feed simulator");
createPost("alex", "Arrays and objects are starting to click");

likePost(1);
likePost(1);
likePost(3);
likePost(3);
likePost(3);
likePost(2);

console.log("Full feed:");
console.log(formatPosts(getFeed()));

console.log("\nSorted by likes:");
console.log(formatPosts(sortByLikes()));

console.log("\nSorted by newest:");
console.log(formatPosts(sortByNewest()));

console.log("\nPosts by alex:");
console.log(formatPosts(getPostsByUser("alex")));

console.log("\nLiking a post that does not exist:");
likePost(99);
