//sort threads by last bump, most recent at top
exports.sortByUpdate = (function sortByUpdate(array,key){
    return array.sort(function(a,b){
        var x = a[key];
        var y = b[key];
        return ((x>y)? -1 : ((x<y)?1:0));
    })
})

//resize picture for preview
exports.previewResize = (function previewResize(dimensions,imgMax){
    var width = dimensions.width;
    var height = dimensions.height;
    var proportion = 0
    if(width>height){
        proportion = width / imgMax;
        width = imgMax;
        height = height / proportion
    } else if(width<height) {
        proportion = height / imgMax;
        height = imgMax;
        width = width / proportion
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
exports.getUnique = (function getOPs(array,item){
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
            posts: 0,
            preview: []
        }
        var thread = posts.filter(function(post){return post.OP === OPs[i]})
        thread = exports.sortByPost(thread,'time')
        myObj.lastBump = thread[thread.length-1].time
        var len = thread.length
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

//get threads relevent to page number from sorted array of all
exports.trimToPage = (function trimToPage(arr,page){
    var firstIndex = (page-1)*10
    var lastIndex = page*10
    return arr.slice(firstIndex,lastIndex)
})
