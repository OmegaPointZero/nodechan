$(document).ready(function(){

    var parseTime = (function(time){
        var ptime = new Date(time);
        var time = String(ptime).split(" ");
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        var month = months.indexOf(time[1])+1
        month < 10 ? month = String("0"+month) : month == month 
        var day = time[2]
        var year = time[3].slice(2)
        return month+"/"+day+"/"+year+" ("+time[0]+") "+time[4] 
    });
        
    /*  takes posts as an array from DB entries, renders them
        in the target div#id */
    var renderPosts = (function(posts,target){
        var post = ""
        for(var i=0;i<posts.length;i++){
            var P = posts[i]
            var postClass=""
            postClass="post reply"
            post += "<div class=\"postContainer\" id=\"p"+P.postID+"\">"
            post += "<div id=\""+P.postID+"\" class=\""+postClass+"\">"
            post += "<div class=\"postInfo\">"
            post += "<span class=\"subject\">"+P.subject+"</span>"
            post += "<span class=\"nameBlock\">"
            post += "<span class=\"name\">"+P.name+"</span>"
            post += "<span class=\"posteruid id_"+P.userID+"\">"
            post += "(ID: <span class=\"hand\" title=\"Highlight posts by this ID\" style=\"background-color:"+P.userIDColor+";\"><a class=\"hand\">"+P.userID+"</a></span>)</span>"
            post += "<span title=\"United States\" class=\"flag flag-us\"></span></span>"
            post += "<span class=\"postTime\">"+parseTime(P.time)+"</span> "
            post += "<span class=\"postNumber\">"
            post += "<a href=\"#"+P.postID+"\" class=\"highlightThisPost\" id=\""+P.postID+"\">No.</a> <a href=\"#\" class=\"quotePostNumber\" id=\""+P.postID+"\">"+P.postID+"</a></span></div>"
            if(P.fileSize){
                post += "<div class=\"file\"><div class=\"fileInfo\">File: <a href=\"/images/"+P.fileName+"\" target=\"_blank\" class=\"fileLink\">"+P.fileOriginalName+"</a>"
                var fs = P.fileSize
                if(fs<1000){
                    post += "("+fs+" Bytes, "+P.fileDimensions;
                } else if(Math.floor(fs/1000 <= 1000)){
                    post += "("+Math.floor(fs/1000)+" KB, "+P.fileDimensions;
                } else if(Math.floor(fs/1000 >= 1000)){
                    post += "("+Math.floor(fs/1000000)+" MB, "+P.fileDimensions;
                }
                post += "</div><div class=\"thumbnail\"><a href=\"/images/"+P.fileName+"\" target=\"_blank\"><img src=\"/images/s"+P.time+".png\" alt=\""+P.fileSize+" Bytes\"></a></div>"
            }
            post += "<div class=\"postMessage\">"
            var body = P.body;
            var mySplit = body.split('\r\n')
            mySplit.forEach(function(lines){
                post += "<span class=\"postContents\" "
                if(/^&gt;/.test(lines)){
                    post += "style=\"color:#789922\""
                }
                post +=">"
                var lArr=lines.split(' ');
                for(var n=0;n<lArr.length;n++){
                    var word=lArr[i]
                    if(/^&gt;&gt;\d+$/.test(word)){
                        lArr[i] = '<a href="#'+word.slice(8)+'" class=\"postLink\">'+word+'</a>'
                    }
                }
                post += lArr.join(' ')
                console.log('lArr:'+lArr.join(' '))
                post += "</span></br>"
            });
            post+="</div></div></div></div>"
            console.log(post)
            if(i==posts.length-1){$(target).html(post)}
        }
    })

    $('button#postByIP').click(function(e){
        var obj = {
        }
        obj.board= $('#getUserByIPBoard').val();
        obj.IP = $('#getUserByIPAddress').val()
        $.ajax({
            type: "POST",
            url: '/api/users',
            data: obj,
            success: function(data){
                var target = "#pulledPostsByIP"
                renderPosts(data,target)
           }
        });
    });

    $('#getUserByIPBoard').on("keypress", function (e) {            
        if (e.keyCode == 13) {
            // Cancel the default action on keypress event
            e.preventDefault(); 
            $('button#postByIP').click();
        }
    });

    $('#getUserByIPAddress').on("keypress", function (e){            
        if (e.keyCode == 13) {
            // Cancel the default action on keypress event
            e.preventDefault(); 
            $('button#postByIP').click();
        }
    });

    $('input.addSticky').on("keypress", function (e){     
        var id = this.id;
        var board = id.slice(10,)       
        if (e.keyCode == 13) {
            // Cancel the default action on keypress event
            e.preventDefault(); 
            $('button#sticky-'+board).click();
        }
    });

    $('.unsticky').click(function(e){
        var id = this.id;
        var s = id.split('-');
        var board = s[1]
        var thread = s[2]
        var obj = {
            action: 'unsticky',
            board: board,
            thread: thread
        }
        $.ajax({
            type: "POST",
            url: '/admin/sticky',
            data: obj,
            success: function(data){
                console.log('received data: ')
                console.log(data)
           }
        });
    });

    $('button.addSticky').click(function(e){
        var thisID = this.id;
        var board = thisID.slice(7,)
        var target = $('#addSticky-'+board).val()
        var obj = {
            action: 'sticky',
            board: board,
            thread: target            
        }
        $.ajax({
            type: "POST",
            url: '/admin/sticky',
            data: obj,
            success: function(data){
                console.log('received data: ')
                console.log(data)
           }
        });
    });

    $('button.delete').click(function(e){
        var thisID = this.id;
        var board = thisID.slice(12,)
        var obj = {
            action: 'Delete',
            board: board,
        }
        $.ajax({
            type: "POST",
            url: '/admin/boards',
            data: obj,
            success: function(data){
                $('#be-'+board).html(data);
           }
        });
    });

});
