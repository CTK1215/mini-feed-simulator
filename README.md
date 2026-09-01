# Mini Feed Simulator

The engine behind a simple social feed, built with core JavaScript only. No browser UI, no frameworks, no DOM. This is the data layer: the logic that creates, stores, likes, sorts, and filters posts before anything would ever hit a screen.

Built for the Codecademy full-stack arrays and objects unit.

## Post structure

Every post is an object shaped like this:

```js
{
  id: 1,
  username: "alex",
  content: "Hello world",
  likes: 2,
  timestamp: 1756700000000
}
```

Posts live in a single `feed` array.

## Functions

| Function | What it does |
|---|---|
| `createPost(username, content)` | Builds a post with a unique id, zero likes, and a timestamp, then pushes it onto the feed |
| `likePost(postId)` | Finds the post by id and adds one like |
| `getFeed()` | Returns all posts |
| `sortByNewest()` | Returns a copy of the feed sorted newest first |
| `sortByLikes()` | Returns a copy of the feed sorted by most likes |
| `getPostsByUser(username)` | Returns only that user's posts |
| `formatPosts(posts)` | Maps posts to readable one-line strings for console output |

The sort functions spread the feed into a new array before sorting, so the original feed order never gets mutated.

## Run it

```
node index.js
```

The demo at the bottom of `index.js` creates a few posts, likes some of them, then prints the full feed, both sorted views, a filtered view for one user, and the miss case for liking a post that does not exist.
