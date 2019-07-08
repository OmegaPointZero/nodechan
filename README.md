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
+ Has an admin panel where admins can log in
+ Skeleton of Admin panel has a place to add/delete boards, manage stickied threads, manage bans based on IP address, manage reported threads, and view all posts by the same IP address
+ Posts by IP Address is functional
+ Sticky is semi-functional
    + Can get list of all stickies per board

## Immediate to-do:
High Priority:
+ Make pop-up to prevent accidental 'delete' button mashing

Medium Priority:
+ Implement way for any user to report a thread
    + Pop-up to record the Board, Post Number, A list of possible reasons, push to server
    + Let server add reporting IP Address, set 'reviewed' to false, record time
    + Let admin panel access from the DB, record which admin accesses it and force them to pick an action to take
+ Implement IP bans: Make schema for DB that holds IPs, time of ban, duration of ban, reason for ban, relevant boards
    + Send ban information to relevant IP when banned IP tries to post
    + Do not let banned IP addresses post
    + Make middleware to check IPs before performing a POST?

Low Priority:
+ Shell script to check for the existence of folders that need to be created if freshly downloaded from github, create them if they don't exist, and then run `node app.js`; put this in the package.json as the startup script
+ Update 'To-Implement' list of README
+ Determine whether visitor is using IPv4 or IPv6, use ONLY the relevant IP version in logging
+ Clean up/consolidate /admin/boards route action handler

## To Implement:
1. User-facing front end:
+ Cookie to keep track of options
    + Color Scheme
    + Open images in new tab/open in page/fit to page
    + WebM's play with/without sound
+ Flags based on Location
+ Reporting a post 
+ Update thread via ajax without updating the page
+ Added viewport for mobile viewing, need to make a div that holds background color in fixed place that isn't the actual body tab. Position: fixed fixes mobile viewport rendering but doesn't let you scroll.


2. Back-End server-side:
+ Wordfilters
+ IP Bans
+ Locked threads        
+ Reported Threads
    + Gets notification for reported thread
+ Banners
+ API endpoints to:
    + Update Thread replies
    + Get thread's page number
    + Update thread metadata
+ If thread is locked, do not allow user to reply
+ Sticky threads: if thread is stickied, sticky to top of the board

## To Be fixed:
1. Using the Delete function on the boards.ejs page doesn't delete the entire thread, just OP
2. Incorrect Login Credentials cause a crash.
3. Refreshing Authenticated Page after restarting server logs "incorrect password"
