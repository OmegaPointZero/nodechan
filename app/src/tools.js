const md5 = require('md5')
const postManager = require('./post')

// replies / images / posters / page
exports.threadMetaData = (function threadMetaData(posts){
    var replies = posts.length;
    var images = exports.countImages(posts);
    var posters = exports.getUnique(posts,'IP');
    
    var obj = {
        replies: replies,
        images: images,
        posters: posters.length,
    }
    
    return obj;
})


//Get number of images for thread
exports.countImages = (function countImages(posts){
    var images = 0;
    for(var i=0;i<posts.length;i++){
        var thisPost = posts[i]
        if(thisPost.fileSize != undefined){
            images++
        }
    }
    return images
})

exports.filename = (function(file){
    var fn = file.originalname
    var fn = fn.split(' ').join('')
    var splits = fn.split('.')
    var ext = splits.pop()
    var nn = fn.split(ext).join()
    newname = nn.replace(/\W/g, '')
    if(newname==""){
        newname="file."+ext
    } else {
        newname = newname+"."+ext
    }
    return newname
})

//Make userID based on md5 of OP number and IP Address
exports.makeID = (function makeOP(OP,IP){
    var str = String(OP+IP)
    var crypt = md5(str)
    var len = crypt.length;
    var sliced = crypt.slice(len-8,len)
    return sliced
})

//sort threads by last bump, most recent at top

exports.sortStickies = (function sortStickies(prelim){
    for(var i=0;i<prelim.length;i++){
        if(prelim[i].sticky==true){
            var a = prelim.splice(i,1)
            prelim.unshift(a[0])
        }
        if(i==prelim.length-1){
            return prelim
        }
    }
})

exports.sortByUpdate = (function sortByUpdate(array,key){
    var prelimSort = array.sort(function(a,b){
        var x = a[key];
        var y = b[key];
        return ((x>y)? -1 : ((x<y)?1:0));
    })
    return exports.sortStickies(prelimSort)
})

//resize picture for preview
exports.previewResize = (function previewResize(dimensions,imgMax){
    var width = dimensions.width;
    var height = dimensions.height;
    var proportion = 0
    if(width>height){
        proportion = width / imgMax;
        width = imgMax;
        height = Math.floor(height / proportion)
    } else if(width<height) {
        proportion = height / imgMax;
        height = imgMax;
        width = Math.floor(width / proportion)
    } else if(width==height) {
        width = imgMax;
        height = imgMax;
    }
    
    var resized = {
        width: width,
        height: height,
    }
    return resized;

})

//sort thread by post, most recent post at bottom
exports.sortByPost = (function sortByPost(array,key){
    return array.sort(function(a,b){
        var x = a[key];
        var y = b[key];
        return ((x<y)? -1 : ((x>y)?1:0));
    })
})

//Get every unique OP for all posts passed to it
exports.getUnique = (function getUnique(array,item){
    allitems = array.map(a=>a[item])
    uniqueItems = allitems.filter(function(post,position){
        return allitems.indexOf(post) == position
    })
    return uniqueItems
})

exports.trimPreview = (function trimPreview(array){
    var newArr = [];
    newArr[0] = array[0];
    newArr[1] = array[array.length-3]
    newArr[2] = array[array.length-2]
    newArr[3] = array[array.length-1]
    return newArr;        
})

//Get threads in bumped order by page
exports.getThreadBumps = (function getThreadBumps(OPs,posts){
    var opArr = [];     
    for(var i=0;i<OPs.length;i++){
        var myObj ={
            OP : OPs[i],
            lastBump : 0,
            images: 0,
            posts: 0,
            sticky: false,
            locked: false,
            preview: [],
        }
        var thread = posts.filter(function(post){return post.OP === OPs[i]})
        thread = exports.sortByPost(thread,'time')
        myObj.sticky = thread[0].sticky
        myObj.locked = thread[0].locked
        myObj.lastBump = thread[thread.length-1].time
        var len = thread.length
        for(var j=0;j<len;j++){
            if(thread[j].fileName){
                myObj.images++;
            }
        }
        myObj.posts = len
        opArr[i] = myObj;   
        if(len<5){
            myObj.preview = thread
        } else {
            myObj.preview = exports.trimPreview(thread)
        }
        opArr[i] = myObj
        if(i==OPs.length-1){
            return exports.sortByUpdate(opArr,'lastBump')
        } 
    }
})

exports.trimCatalog = (function trimCatalog(threads){
    var catalog = []
    for(var i=0;i<threads.length;i++){
        catalog[i] = threads[i];
        var prev = threads[i].preview
        catalog[i].preview = prev.filter(function(posts){return posts.postID == posts.OP})
        if(i==threads.length-1){
            return catalog;
        }
    }

});

//get threads relevent to page number from sorted array of all
exports.trimToPage = (function trimToPage(arr,page){
    var firstIndex = (page-1)*10
    var lastIndex = page*10
    return arr.slice(firstIndex,lastIndex)
})

//Generate a random set of RGB values
exports.makeRGB = (function randRGB(OP,IP){
    var value = String(OP+IP)
    var converted = md5(value);
    converted = converted.slice(converted.length-6,converted.length)
    var rgb = 'rgb('+parseInt(converted.slice(0,2),16)+','+parseInt(converted.slice(2,4),16)+','+parseInt(converted.slice(4,6),16)+',1)'
    return rgb
});
