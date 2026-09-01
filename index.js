// Mini Feed Simulator
// The data layer behind a simple social feed. No DOM, no frameworks,
// just core JavaScript run with Node.

const feed = [];
let nextId = 1;

// Creates a post object, gives it a unique id, zero likes, and a
// timestamp, then adds it to the feed.
function createPost(username, content) {
  const post = {
    id: nextId,
    username: username,
    content: content,
    likes: 0,
    timestamp: Date.now() + nextId, // nudge keeps timestamps unique when posts are created in the same millisecond
  };
  nextId++;
  feed.push(post);
  return post;
}

// Finds the post with the matching id and adds one like.
function likePost(postId) {
  const post = feed.find((p) => p.id === postId);
  if (!post) {
    console.log(`No post found with id ${postId}`);
    return null;
  }
  post.likes++;
  return post;
}

// Returns every post in the feed.
function getFeed() {
  return feed;
}

// Returns posts sorted newest first. Spread copies the array so the
// original feed order is left alone.
function sortByNewest() {
  return [...feed].sort((a, b) => b.timestamp - a.timestamp);
}

// Returns posts sorted most likes first.
function sortByLikes() {
  return [...feed].sort((a, b) => b.likes - a.likes);
}

// Returns only the posts created by the given user.
function getPostsByUser(username) {
  return feed.filter((post) => post.username === username);
}

// Turns a list of posts into readable lines for the console.
function formatPosts(posts) {
  return posts.map(
    (post) => `#${post.id} @${post.username}: "${post.content}" (${post.likes} likes)`
  );
}

// --- Demo run ---

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
