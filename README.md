# nodechan
A 4chan clone built with Node.js and Express.js

## Before Running
You must have a MongoDB server running, and specify the URI 
to the MongoDB in line 10 of app.js :

`var configURL = "mongodb://@127.0.0.1:27017/nodechan"`

You will also need to make 3 folders in the `public/` folder, `public/temporary`, `public/images`, and `public/staticImages/banners`, the latter of which must contain banner images.


## Currently Functional Features:

+ Yotsuba color scheme
+ You can post a new thread on a board
+ New Threads MUST have an image, text is optional
+ Upon creating a thread, you are redirected to it
+ You can reply to a thread with text, an image, or both, but not neither
+ New replies bump a thread on the board page
+ After 100 threads, new threads cause old ones to 404
+ User ID's per thread
+ Color scheme for said IDs
+ Highlight post by selecting No.
+ Highlight all posts by same user in thread
+ Greentext
+ 404 if attempting to access board that doesn't exist
+ 404 if attempting to access a valid board with invalid page
+ A way to serve a blank board, provided it exists in the DB, and 404 otherwise
+ Quoting a post
+ Thread metadata: posts, unique posters, replies, image replies 
+ Frontend architecture for deleting threads, updating, etc
+ Custom 404 for invalid paths
+ Deleting a post/thread (modules to handle this are in place)
+ Rotating Banners
+ Catalog view

Admin Properties
+ Can add, delete and edit boards
+ Can manage sticky threads, adding and deleting them from each board
+ Can Get all posts by the same IP Address
+ Can see all reported posts, actionable reponses being built

## Immediate to-do: 
Medium Priority:   
+ Front End stuff:
    + First of all, make sure all of the post/image information renders correctly
    + Second, run tests of posts of various lengths render properly
    + Figure out how to make posts appear aligned *properly*
    + MAKE EVERYTHING RESPONSIVE AND LOOK GOOD ON MOBILE, that needs a lot of work

Low Priority:
+ Shell script to check for the existence of folders that need to be created if freshly downloaded from github, create them if they don't exist, and then run `node app.js`; put this in the package.json as the startup script
+ Update 'To-Implement' list of README
+ Clean up/consolidate /admin/boards route action handler

## To Implement:
1. User-facing front end:
+ Cookie to keep track of options
    + Color Scheme
    + Open images in new tab/open in page/fit to page
    + WebM's play with/without sound
+ Flags based on Location
+ Update thread via ajax without updating the page
+ Added viewport for mobile viewing, need to make a div that holds background color in fixed place that isn't the actual body tab. Position: fixed fixes mobile viewport rendering but doesn't let you scroll.


2. Back-End server-side:
+ Wordfilters
+ IP Bans
+ Locked threads        
+ Reported Threads
    + Admin Gets notification for reported thread
+ Banners
+ API endpoints to:
    + Get specific posts
    + Update Thread replies
    + Get thread's page number
    + Update thread metadata
+ If thread is locked, do not allow user to reply
+ Sticky threads: if thread is stickied, sticky to top of the board

## To Be fixed:
1. Using the Delete function on the boards.ejs page doesn't delete the entire thread, just OP
2. Incorrect Login Credentials cause a crash.
3. Refreshing Authenticated Page after restarting server logs "incorrect password"
