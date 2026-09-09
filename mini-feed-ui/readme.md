# Project: Mini Feed UI

## Description

In this project, you will take the logic from your **Mini Feed Simulator** and connect it to a real interface using the **DOM** and **event listeners**.

Your goal is to let a user interact with the feed in the browser. Instead of only working in the console, users will be able to create posts, view posts, and like posts through a working UI.

This project is about **layering a front end on top of the JavaScript logic you already built**. You are not starting over. You are extending your existing work.

By the end of this project, you will have a small social feed app that responds to user actions in the browser.

---

## Learning Objectives

- Practice selecting and updating DOM elements
- Use event listeners to respond to user actions
- Render JavaScript data onto the page
- Connect application logic to a browser UI
- Reinforce arrays, objects, functions, and DOM manipulation

---

## Project Requirements

You will build a browser-based version of your Mini Feed project.

### Your app must allow a user to:

- Create a new post
- View all posts on the page
- Like a post
- Re-render the feed after updates

---

## Suggested Layout

Your page should include:

- A page title
- A form or input section for creating a post
- An area where all posts are displayed

### Example input fields:

- Username
- Post content
- Submit button

---

## Required Features

### 1. Render Posts to the Page

Create a function that displays all posts in the browser.

Example idea:

```js
renderFeed();
```

This function should:

- Clear the current feed display
- Loop through your posts array
- Create DOM elements for each post
- Show the username, content, and likes
- Add a Like button to each post

---

### 2. Create a New Post with the UI

When the user submits the form:

- Grab the values from the inputs
- Call your existing `createPost()` logic
- Re-render the feed
- Clear the form inputs

---

### 3. Like a Post from the UI

Each post should have a Like button.

When the button is clicked:

- Identify which post was clicked
- Call your existing `likePost()` logic
- Re-render the feed

---

### 4. Keep Logic and UI Separate

Your original feed logic should still handle:

- storing posts
- creating posts
- liking posts
- sorting/filtering if you included those features

Your DOM code should handle:

- reading input values
- creating HTML elements
- appending elements to the page
- attaching event listeners
- updating what the user sees

---

## Suggested File Structure

```text
mini-feed-ui/
│
├── index.html
├── style.css
└── script.js
```

---

## HTML Suggestions

Your `index.html` should include:

- A heading
- An input for username
- A textarea or input for post content
- A button to submit a post
- A container to hold the feed

---

## JavaScript Suggestions

Your `script.js` should include:

- Your feed array
- Your `createPost()` function
- Your `likePost()` function
- A `renderFeed()` function
- Event listeners for:
  - post submission
  - like buttons

---

## Style Suggestions

Your UI does not need to be advanced, but it should be clean and readable.

Consider styling:

- the page container
- the post cards
- buttons
- form inputs
- spacing between posts

---

## Stretch Goals

1. Add a Delete button for each post
2. Add a way to sort by newest
3. Add a way to sort by most liked
4. Filter posts by username
5. Show a message when there are no posts

---

## Submission Checklist

Your project should:

- display posts in the browser
- allow users to create posts from a form
- allow users to like posts with a button
- use DOM manipulation
- use event listeners
- re-render the UI after updates
- run without errors

---

## Deliverable

Submit a project folder containing:

- `index.html`
- `style.css`
- `script.js`

Your final app should let a user interact with the feed visually in the browser.
