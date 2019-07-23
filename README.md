# nodechan
A chan-style imageboard and API built with Node.js, Express.js and MongoDB

## !Attention!
Nodechan is going through a heavy overhaul right now, including a forced rollback to this previous, working version. In attempting to fix a few things, everything broke. 

## Before Running
You will need to create a .env file:
+ MONGO=linkToMongoURI
+ SESSION_SECRET=secretForExpressSession
+ LOGINROUTE=urlPathforLoginPage
+ ADMINROUTE=urlPathforAdminPage

the Login and Admin routes aren't just held as '/login' and '/admin' for security reasons; if the door is hidden hacker's cant try to break through it. As it stands, I need to write a new middleware that *doesn't* redirect the user to the login page if they attempt to access a route for admins, because attackers can enumerate the /login route via API calls to admin endpoints.

The init.sh script creates the necessary folders to hold uploaded files and run the server. You can either run "./init.sh" or "npm start". Nodechan comes with 2 site banners; you can add additional images (300x100) to the folder /public/staticImages/banners/ to add more. There will be an admin panel entry shortly to take care of this.

This currently needs to be tested with ZERO boards on a fresh Mongo database, and running it without adding any boards first might cause it to crash. 

THE VERY FIRST TIME YOU RUN THIS SERVER, you should comment out lines 215-219 of /app/routes.js, and uncomment lines 225-228. Start the server, make sure it connects to your Mongo Database, and whatever username/password you put in, Nodechan will write to the database as an admin. Do this for whatever administrators you want initially, then comment out lines 225-228 and uncomment 215-219 again. This will then allow you to run the nodechan server and log into it as an administrator. Nodechan doesn't allow user/admin registration by design for security reasons, so this is a quick and easy way unless you want to enter the schema information manually.

Future updates will allow existing administrators to register new administrators, but that's not quite priority right now.


# API Documentation

## Userland API Endpoints

**Board List**
----
    Returns json data about active boards
* **URL**

    /api/boardlist
    
* **Method**

    `GET`

**Board Page**
----
    Returns json data about the posts on a board of a given page
    
* **URL**

    /api/:board/:page?
    
* **Method**

    `GET`
    
* **URL Params**

    **Required**
    
    `board=[string]`
    
    **Optional**
    
    `page=[integer]`
    
    Must be between pages 1-10; default is 1.
    

**Thread**
----
    Returns json data about all posts in a thread for a GET, writes a post to the thread with POST
    
* **URL**

    /api/:board/thread/:thread
    
* **Method**

    `GET`
    
* **URL Params**

    **Required**
    
    `board=[string]`
    
    `thread=[integer]`

* **Method**

    `POST`
* **URL Params**

    **Required**
    
    `board=[string]`
    
    `thread=[integer]`
    
* **Data Params**

    `name=[string]`
    
    `subject=[string]`
    
    `thread=[integer]`
    
    **Sample Body POST**
    
    `{ name: 'Anon', subject: 'Thread', text: 'Sample text of a post' }`

**Post Data**
----
    Returns json data about a specified post
    
* **URL**

    /api/:board/post/:post
    
* **Method**

    `GET`
* **URL Params**

    **Required**
    
    `board=[string]`
    
    `post=[integer]`
    
**Update Thread**
----
    Returns json data about all posts made in a thread following a specified post number, to udpate the thread via AJAX without forcing the user to refresh the entire page
    
* **URL**

    /api/update/:board/:thread/:post
    
* **Method**

    `GET`
    
* **URL Params**

    **Required**
    
    `board=[string]`
    
    `thread=[integer]`
    
    `post=[integer]`

**Post Thread**
----
    Posts a new thread to the specified board, provided the user is not banned
    
* **URL**

    /api/:board
    
* **Method**

    `POST`
    
* **URL Params**

    **Required**
    
    `board=[string]`
    
* **Data Params**

    `name=[string]`
    
    `subject=[string]`
    
    `thread=[integer]`
    
    <Must have an image uploaded as well, will expand documentation>
    
    **Sample Body POST**
    
    `{ name: 'Anon', subject: 'Thread', text: 'Sample text of a post' }`

## Admin API Endpoints

**Users**
----
    Returns all posts made by a user of a specific IP Address, provided the Admin is logged in
    
* **URL**

    /api/users
    
* **Method**

    `POST`
    
* **URL Params**

    None
    
* **Data Params**

    `board=[string]`
    
    `IP=[string]`
    
**Sample Body POST**

    `{ board: 'js', IP: '192.168.0.1'}`
    
**Reports**
----
    Gets all active reports of posts made to Admins, provided the Admin is logged in
    
* **URL**

    /api/admin/reports
    
* **Method**

    `GET`
    
* **URL Params**

    None

** Bans **
----
    Gets all active IP Bans, provided the Admin is logged in
    
* **URL**

    /api/admin/bans
    
* **Method**

    `GET`
    
* **URL Params**

    None



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
+ User ID colors: detect if they're bright or dark, make ID *text* color contrast it
+ Shorten original filenames if too long
+ Cookie to keep track of user-supplied options:
    + Color Scheme
    + Open images in new tab/open in pageboards/b/fit to page
    + WebM's play with/without sound
+ Country Flags based on IP Address location
+ Realign the way post information is rendered and aligned
+ Run tests of posts of various lengths render properly
+ MAKE EVERYTHING RESPONSIVE AND LOOK GOOD ON MOBILE, that needs a lot of work

### Back-End server-side:
+ Wordfilters
+ Manage Banners
+ Allow Admins to lock threads, don't let users reply, only admins
+ Add helmet.js for security
+ Add new middleware for admins accessing the API endpoints for admins that doens't allow attackers to enumerate the login route

### API
+ Modify the /api/users to be /api/admin/users, to be consistent with admin route nomenclature
+ Add additional documentation of how to make proper calls, what responses should look like, and what errors one can get

## To Fix:
+ Delete button on boards.ejs doesn't function the same as from within the thread, not deleting the entire thread if the OP is selected
+ Upon deleting a thread, from the thread.ejs view, redirects to 404; should redirect to the main board page

