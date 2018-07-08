//sort threads by last bump, most recent at top
exports.sortByUpdate = (function sortByUpdate(array,key){
    return array.sort(function(a,b){
        var x = a[key];
        var y = b[key];
        return ((x>y)? -1 : ((x<y)?1:0));
    })
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
exports.getOPs = (function getOPs(array){
    allOPs = array.map(a=>a.OP)
    uniqueOPs = allOPs.filter(function(post,position){
        return allOPs.indexOf(post) == position
    })
    return uniqueOPs
})

exports.trimPreview = (function trimPreview(array){
    console.log(array)
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
