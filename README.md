# nodechan
A chan-style imageboard and API built with Node.js, Express.js and MongoDB

## Before Running
You will need to create a .env file:
+ MONGO=linkToMongoURI
+ SESSION_SECRET=secretForExpressSession
+ LOGINROUTE=urlPathforLoginPage
+ ADMINROUTE=urlPathforAdminPage

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
+ Highlight post by selecting "No." next to post number
+ Ability to highlight all posts by same user in thread by clicking on user ID
+ Greentexting by starting a new line with ">"
+ 404 if attempting to access board that doesn't exist
+ 404 if attempting to access a valid board with invalid page
+ A way to serve a blank board, provided it exists in the DB, and 404 otherwise 
+ Quoting a post
+ Thread metadata: posts, unique posters, replies, image replies 
+ Custom 404 path for invalid paths
+ Deleting a post/thread if coming from the same IP Address
+ Randomly served banners
+ Catalog view
+ Users can report threads to admins

Admin Properties
+ Can add, delete and edit boards
+ Can manage sticky threads, adding and deleting them from each board
+ Can Get all posts by the same IP Address
+ Can see all reported posts, and ban users based on reports
+ Can see all banned IP addresses, and edit/delete bans


## To Implement:

### User-facing front end:
+ Cookie to keep track of user-supplied options:
    + Color Scheme
    + Open images in new tab/open in page/fit to page
    + WebM's play with/without sound
+ Country Flags based on IP Address location
+ Realign the way post information is rendered and aligned
+ Run tests of posts of various lengths render properly
+ MAKE EVERYTHING RESPONSIVE AND LOOK GOOD ON MOBILE, that needs a lot of work

### Back-End server-side:
+ Wordfilters
+ Manage Banners
+ Allow Admins to lock threads, don't let users reply, only admins
+ Posting an Empty response crashes server

## To fix:

### Front End:
+ Report Button doesn't work on dynamically loaded content
+ Updated replies not loading with Post Number

### Back end:
+ Whenever the url contains a number parameter, if it's not a number, the server crashes. Fix this.
+ When a filename contains only a slash, it doesn't save the filename, and it also didn't generate a preview. Fix this.
