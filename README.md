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

* **Sample AJAX Request**

    ```
    $.ajax({
        type: "GET",
        url: 'http://nodechan/api/boardlist',
        success: function(data){
            console.log(data)
        }
    });
    ```
* **Sample API Response**    

    ```
    [ 
        {"stickyThreads":[],"lockedThreads":[],"_id":"5b612125fb6fc072a40d6bde","boardCode":"js","boardTitle":"Javascript","category":"Programming"}, 
        {"stickyThreads":[],"lockedThreads":[],"_id":"5b61215ffb6fc072a40d6c0c","boardCode":"asm","boardTitle":"Assembly and Shellcoding","category":"Programming"},
        {"stickyThreads":[],"lockedThreads":[],"_id":"5b612143fb6fc072a40d6bec","boardCode":"web","boardTitle":"Web Development General","category":"Programming"},
        {"stickyThreads":[],"lockedThreads":[],"_id":"5b6121defb6fc072a40d6c34","boardCode":"gif","boardTitle":"Animated GIF and WEBM","category":"General"},
        {"stickyThreads":[],"lockedThreads":[],"_id":"5b612213fb6fc072a40d6c44","boardCode":"meme","boardTitle":"Memes","category":"Internet Culture"},
        {"stickyThreads":["1"],"lockedThreads":["1"],"_id":"5b612277fb6fc072a40d6c62","boardCode":"b","boardTitle":"Random","category":"General"},
        {"stickyThreads":[],"lockedThreads":[],"_id":"5b61225ffb6fc072a40d6c59","boardCode":"art","boardTitle":"Art","category":"General"},
        {"stickyThreads":[],"lockedThreads":[],"_id":"5b6121f6fb6fc072a40d6c37","boardCode":"rel","boardTitle":"Religion","category":"General"},
        {"stickyThreads":[],"lockedThreads":[],"_id":"5b6121c7fb6fc072a40d6c33","boardCode":"k","boardTitle":"Weapons","category":"General"},
        {"stickyThreads":[],"lockedThreads":[],"_id":"5b6120f6fb6fc072a40d6bd2","boardCode":"py","boardTitle":"Python","category":"Programming"},
        {"stickyThreads":[],"lockedThreads":[],"_id":"5b6121abfb6fc072a40d6c2d","boardCode":"pol","boardTitle":"Politically Incorrect","category":"General"}
    ]
    
        ```

**Board Page**
----
    Returns json data about the posts on a board of a given page
    
* **URL**

    /api/board/:board/:page?
    
* **Method**

    `GET`
    
* **URL Params**

    **Required**
    
    `board=[string]`
    
    **Optional**
    
    `page=[integer]`
    
    Must be between pages 1-10; default is 1.
    
    
* **Sample AJAX Request**

    ```
    $.ajax({
        type: "GET",
        url: 'http://nodechan/api/board/b',
        success: function(data){
            console.log(data)
        }
    });
    ```
* **Sample API Response** 

    ```
    [   
        {"_id":"5d37dbd36840925c87a48398","publicBan":false,"locked":true,"sticky":true,"IP":"stripped","name":"","subject":"","board":"b","body":"Testing it out!","fileName":"1563941842216.png","fileOriginalName":"dice.png","fileSize":"588421","fileDimensions":"598 x 600","time":1563941842216,"OP":1,"userID":"e12d9485","userIDColor":"rgb(45,148,133,1)","postID":1,"__v":0},
        {"_id":"5d37de091bedae5df6f9a517","publicBan":false,"locked":false,"sticky":false,"IP":"stripped","name":"","subject":"","board":"b","body":"","fileName":"1563942409270.png","fileOriginalName":"apuhug.png","fileSize":"91948","fileDimensions":"820 x 500","time":1563942409270,"OP":2,"userID":"d3795d28","userIDColor":"rgb(121,93,40,1)","postID":2,"__v":0},
        {"_id":"5d37de141bedae5df6f9a518","publicBan":false,"locked":false,"sticky":false,"IP":"stripped","name":"","subject":"","board":"b","body":"Derpa doo","fileName":"1563942420636.jpeg","fileOriginalName":"serveimage.jpeg","fileSize":"58909","fileDimensions":"1280 x 720","time":1563942420636,"OP":2,"userID":"d3795d28","userIDColor":"rgb(121,93,40,1)","postID":3,"__v":0}
    ]
    ```

**Board Catalog**
----
    Returns JSON data to populate the catalog.

* **URL**

    /api/catalog/:board

* **Method**

    `GET`

* **URL Params**

    **Required**
    
    `board=[string]`

* **Sample AJAX Get Request**

    ```
    $.ajax({
        type: "GET",
        url: 'http://nodechan/api/catalog/b/',
        success: function(data){
            console.log(data)
        }
    });
    ```

* **Sample Server Response**

    ```
    [{"OP":1,"lastBump":1564806000308,"images":1,"posts":1,"sticky":false,"locked":false,"preview":[{"_id":"5d450b708f83290018dbac7e","publicBan":false,"locked":false,"sticky":false,"IP":"::ffff:10.5.168.154","name":"Admin","subject":"Welcome!","board":"b","body":"Hello friends! This is the random board! ","fileName":"1564806000308.png","fileOriginalName":"dice.png","fileSize":"588421","fileDimensions":"598 x 600","time":1564806000308,"OP":1,"userID":"4a69a882","userIDColor":"rgb(105,168,130,1)","postID":1,"__v":0}]}]
    ```

**Thread Data**
----
    Returns json data about all posts in a thread for a GET, writes a post to the thread with POST
    
* **URL**

    /api/thread/:board/:thread
    
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
       
* **Sample AJAX GET Request**

    ```
    $.ajax({
        type: "GET",
        url: 'http://nodechan/api/thread/b/2',
        success: function(data){
            console.log(data)
        }
    });
    ```
* **Sample API GET Response** 
    ```
    [
        {"_id":"5d37de091bedae5df6f9a517","publicBan":false,"locked":false,"sticky":false,"IP":"stripped","name":"","subject":"","board":"b","body":"","fileName":"1563942409270.png","fileOriginalName":"apuhug.png","fileSize":"91948","fileDimensions":"820 x 500","time":1563942409270,"OP":2,"userID":"d3795d28","userIDColor":"rgb(121,93,40,1)","postID":2,"__v":0},
        {"_id":"5d37de141bedae5df6f9a518","publicBan":false,"locked":false,"sticky":false,"IP":"stripped","name":"","subject":"","board":"b","body":"Derpa doo","fileName":"1563942420636.jpeg","fileOriginalName":"serveimage.jpeg","fileSize":"58909","fileDimensions":"1280 x 720","time":1563942420636,"OP":2,"userID":"d3795d28","userIDColor":"rgb(121,93,40,1)","postID":3,"__v":0}
    ]
    ```
    
* **Sample AJAX POST Request**
    
    ```
    $.ajax({
    type: "POST",
    url: 'http://nodechan/api/thread/b/2',
    data: `{ name: 'Anon', subject: 'Thread', text: 'Sample text of a post' }`,
    success: function(data){
        console.log(data)
    }
    ```
    
* **Sample AJAX POST Response**

    After POSTing data, the data returned is equal to a GET request to /api/thread/:board/:post of the relevant thread
    
**Post Data**
----
    Returns json data about a specified post
    
* **URL**

    /api/post/:board/:post
    
* **Method**

    `GET`
* **URL Params**

    **Required**
    
    `board=[string]`
    
    `post=[integer]`
    
    * **Sample AJAX GET Request**

    ```
    $.ajax({
        type: "GET",
        url: 'http://nodechan/api/post/b/2',
        success: function(data){
            console.log(data)
        }
    });
    ```
* **Sample API GET Response** 
    ```
        {"_id":"5d37de091bedae5df6f9a517","publicBan":false,"locked":false,"sticky":false,"IP":"stripped","name":"","subject":"","board":"b","body":"","fileName":"1563942409270.png","fileOriginalName":"apuhug.png","fileSize":"91948","fileDimensions":"820 x 500","time":1563942409270,"OP":2,"userID":"d3795d28","userIDColor":"rgb(121,93,40,1)","postID":2,"__v":0}
    ```
    
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
    
    The thread parameter is the Post Number of the OP of the thread
    The post parameter is the most recent post number in the thread; the api returns all posts in the thread after this post.
    
* **Sample AJAX GET Request**

    ```
    $.ajax({
        type: "GET",
        url: 'http://nodechan/api/update/b/2/2',
        success: function(data){
            console.log(data)
        }
    });
    ```
* **Sample API GET Response** 
    ```
    [
    {"_id":"5d37de141bedae5df6f9a518","publicBan":false,"locked":false,"sticky":false,"IP":"stripped","name":"","subject":"","board":"b","body":"Derpa doo","fileName":"1563942420636.jpeg","fileOriginalName":"serveimage.jpeg","fileSize":"58909","fileDimensions":"1280 x 720","time":1563942420636,"OP":2,"userID":"d3795d28","userIDColor":"rgb(121,93,40,1)","postID":3,"__v":0}
    ]
    ```

**Post Thread**
----
    Posts a new thread to the specified board, provided the user is not banned
    
* **URL**

    /api/boards/:board
    
* **Method**

    `POST`
    
* **URL Params**

    **Required**
    
    `board=[string]`
    
* **Data Params**

    `name=[string]`
    
    `subject=[string]`
    
    `text=[string]`
    
    <Must have an image uploaded as well, will expand documentation>
    
* **Sample AJAX POST Request**
    
    ```
    $.ajax({
    type: "POST",
    url: 'http://nodechan/api/boards/b',
    data: `{ name: 'Anon', subject: 'Thread', text: 'Sample text of a post' }`,
    success: function(data){
        console.log(data)
    }
    ```
    
* **Sample AJAX POST Response**

    After POSTing data, the data returned is equal to a GET request to /api/thread/:board/:post of the relevant thread

## Admin API Endpoints

**Users**
----
    Returns all posts made by a user of a specific IP Address, provided the Admin is logged in
    
* **URL**

    /api/admin/users
    
* **Method**

    `POST`
    
* **URL Params**

    None
    
* **Data Params**

    `board=[string]`
    
    `IP=[string]`
    
**Sample Body POST**

    ```
    $.ajax({
    type: "POST",
    url: 'http://nodechan/api/admin/users',
    data: { board: 'js', IP: '192.168.0.1'},
    success: function(data){
        console.log(data)
    }
    ```
    
**Reports**
----
    Gets all active reports of posts made to Admins, provided the Admin is logged in
    
* **URL**

    /api/admin/reports
    
* **Method**

    `GET`
    
* **URL Params**

    None

* **Sample AJAX GET request**

    ```
    $.ajax({
    type: "GET",
    url: 'http://nodechan/api/admin/reports',
    success: function(data){
        console.log(data)
    }
    ``` 

* **Sample API Response**

    ```
    [{"reason":["rule","spam"],"_id":"5d4306be448fef007e12b66b","board":"b","post":2,"reportingIP":"::ffff:127.0.0.1","reviewed":false,"admin":"","action":"","time":1564673726563,"__v":0}]
    ```

**Bans**
----
    Gets all active IP Bans, provided the Admin is logged in
    
* **URL**

    /api/admin/bans
    
* **Method**

    `GET`
    
* **URL Params**

    None

* **Sample AJAX Request**

    ```
    $.ajax({
        type: "GET",
        url: "http://nodechan/api/admin/bans",
        success: function(data){
            console.log(data)
        }
    })
    ```

* **Sample API Response**
    ```
    [{"_id":"5d43078b448fef007e12b66c","IP":"::ffff:127.0.0.1","start":1564673931022,"end":1564760331022,"reason":"Because Reasons","offense":{"board":"b","post":"2"},"reportingIP":"::ffff:127.0.0.1","admin":"Cimelody-3","__v":0}]
    ```

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
    + Open images in new tab/open in page and fit to page
    + WebM's play with/without sound
+ Country Flags based on IP Address location
+ Run tests of posts of various lengths render properly
+ Clicking on a post number on board.ejs should take user to the thread.ejs view of that thread

### Back-End server-side:
+ Wordfilters
+ Manage Banners
+ Add helmet.js for security
+ Add middleware to prevent users from replying to locked threads (if thread is locked, thread page renders w/o reply form, but updated threads can still reply and can still reply via api)

## To Fix:
+ Delete button on boards.ejs doesn't function the same as from within the thread, not deleting the entire thread if the OP is selected. Will need to rewrite delete function to differ between threads.ejs and board.ejs views.p
