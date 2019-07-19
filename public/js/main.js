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

var renderPosts = (function(posts,target){
    var post = ""
    for(var i=0;i<posts.length;i++){
        var P = posts[i]
        var postClass=""
        post += "<div class=\"postContainer\" id=\"p"+P.postID+"\">"
        post += "<div class=\"memearrows\">>></div>"
        post += "<div id=\"p"+P.postID+"\" class=\"post reply\" >"
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
            post += "</span></br>"
        });
        post+="</div></div></div></div></div>"
        if(i==posts.length-1){
            $(target).append(post)
        }
    }
});

$(document).ready(function(){
        $("a.highlightThisPost").click(function(){
            var str = String(this)
            var post = str.split('#')[1]
            $('div.reply').removeClass('highlight')
            $('div.reply#'+post).addClass('highlight')
        });

        $('.posteruid').click(function(){
            var id = $(this).attr('class').split(' ')[1]
            $('div.reply').removeClass('highlight')
            $('.'+id).parent().parent().parent().addClass('highlight')
            $('.OP').removeClass('highlight')
            
        });

        $('a#update').click(function(e){
                e.preventDefault()
                var OP = $('div.OP').attr('id')
                var posts = $('div.post').map(function(){return Number(this.id)}).toArray()
                var biggest = Math.max(...posts)
                var board = $('.boardTitle').html().split('/')[1]
                var url = '/api/update/'+board+'/'+OP+'/'+6
                $.ajax({
                    type: "GET",
                    url: url,
                    success: function(data){
                        renderPosts(data,'.thread')
                    }
                })
        });

        $('a.postLink').click(function(){
           //b  var post = $(this).attr('href').slice(1)
            $('div.reply').removeClass('highlight')
            $('div.reply#'+post).addClass('highlight')
        });

        $('a.quotePostNumber').click(function(){
            var post = $(this).attr('id')
            $('textarea.text').val($('textarea.text').val()+'>>'+post+'\r\n');       
        })

        $('input#delete').click(function(){
            var id = Number($('input.postDeleteBox:checkbox:checked').attr('id').slice(7,))
            var fo = $('input.deleteImageOnly:checkbox:checked').attr('value')
            fo == undefined ? fo = false : ""; // Image file only
            var win = window.location.pathname
            var w = win.split('/') // /b/thread/7 or /boards/b/
            var OPs = $('div.OP').map(function(){return Number(this.id)}).toArray()
            var index = OPs.indexOf(id)
            var OP
            index != -1 ? OP = OPs[index] : OP = 0;
            var board = $('.boardTitle').html().split('/')[1]
            $.post('/'+board+'/delete',{board,id,fo,OP}, function(data,status){
                console.log("Status: "+status);
            })
                if(w.length==3){
                    location.reload();
                } else if(w.length==4){
                    index == -1 ? location.reload() : location.href='/boards/'+w[1] 
                }
        });

        $('.report').click(function(e) {
            e.preventDefault();
            var id = this.id;
            console.log(id);
            $('#m'+id).toggleClass('hidden')
        });

    })

