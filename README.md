# nodechan
A chan-style imageboard and API built with Node.js, Express.js and MongoDB

## Before Running
You will need to create a .env file:
MONGO=linkToMongoURI
SESSION_SECRET=secretForExpressSession
LOGINROUTE=urlPathforLoginPage
ADMINROUTE=urlPathforAdminPage

Login and Admin aren't just held as '/login' and '/admin' for security reasons; if the door is hidden hacker's cant try to break through it.

The init.sh script creates the necessary folders to hold uploaded files and run the server. You can either run "./init.sh" or "npm start"

## Currently Functional Features:

+ Yotsuba color scheme
+ You can post a new thread on a board; new threads MUST have an image, text is optional
+ Upon creating a thread, you are redirected to it
+ You can reply to a thread with text, an image, or both, but not neither
+ New replies bump a thread on the board page
+ After 100 threads, new threads cause old ones to 404
+ Unique user ID's per thread
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
+ Custom 404 path for invalid paths
+ Deleting a post/thread now 100% operational
+ Rotating Banners
+ Catalog view
+ Users can report threads

Admin Properties
+ Can add, delete and edit boards
+ Can manage sticky threads, adding and deleting them from each board
+ Can Get all posts by the same IP Address
+ Can see all reported posts, and ban users based on reports
+ Can see all banned IP addresses, and edit/delete bans

## Immediate to-do: 
+ Fix the following:
    + If images are uploaded, server sends response often before they're done being processed, resulting in broken images

+ Front End stuff:
    + First of all, make sure all of the post/image information renders correctly
    + Second, run tests of posts of various lengths render properly
    + Figure out how to make posts appear aligned *properly*
    + MAKE EVERYTHING RESPONSIVE AND LOOK GOOD ON MOBILE, that needs a lot of work


## To Implement:
1. User-facing front end:
+ Cookie to keep track of options
    + Color Scheme
    + Open images in new tab/open in page/fit to page
    + WebM's play with/without sound
+ Flags based on Location
+ Update thread via ajax without refreshing entire page
+ Added viewport for mobile viewing, need to make a div that holds background color in fixed place that isn't the actual body tab. Position: fixed fixes mobile viewport rendering but doesn't let you scroll.

2. Back-End server-side:
+ Protect User IP Addresses in API requests, make it so ONLY admins get access to user IP's
+ Wordfilters
+ Banners
+ API endpoints to:
    + Update Thread replies
    + Get thread's page number
    + Update thread metadata
+ If thread is locked, do not allow user to reply
