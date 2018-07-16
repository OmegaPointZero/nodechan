# nodechan
A 4chan clone built with Node.js and Express.js

## Before Running
You must have a MongoDB server running, and specify the URI 
to the MongoDB in line 10 of app.js :

`var configURL = "mongodb://@127.0.0.1:27017/nodechan"`

You will also need to make 2 folders in the `public/` folder, `public/temporary` and `public/images`

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
+ Greentext

## To Implement:
1. User-facing front end:
+ Flags based on Location
+ Quoting a post
+ Reporting a post
+ Deleting a post/thread (modules to handle this are in place)
+ Home Page
+ Settings for the user to customize experience
    + Multiple options for colors
    + Options to expand images instead of opening in new
+ Rotating Banners
+ A way to serve a blank board, provided it exists in the DB, and 404 otherwise
+ Custom 404 for invalid paths
+ Thread metadata: posts, unique posters, replies, image replies 
+ Update thread via ajax without updating the page

2. Back-End server-side:
+ Admin/Mod login
    + Admins can manage:    
        + Wordfilters
        + IP Bans
        + Sticky
        + Lock threads        
+ A way to serve a blank board, provided it exists in the DB, and 404 otherwise
+ Custom 404 for invalid paths
+ Modifying/adding paths for other front-end stuff not yet done
