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

var renderPosts = (function(posts,target,board){
    var post = ""
    for(var i=0;i<posts.length;i++){
        var P = posts[i]
        var name = P.name
        if(name.length==0){
            name = "Anonymous"
        }
        post += "<div class=\"postContainer\" id=\"p"+P.postID+"\">"
        post += "<div class=\"memearrows\">>></div>"
        post += "<div id=\""+P.postID+"\" class=\"post reply\" >"
        post += "<div class=\"postInfo\">"
        post += "<input type=\"checkbox\" id=\"delete_"+P.postID+"\" class=\"postDeleteBox\" value=\"delete\">"
        post += "<span class=\"subject\">"+P.subject+"</span>"
        post += "<span class=\"nameBlock\">"
        post += "<span class=\"name\">"+name+"</span>"
        post += "<span class=\"posteruid id_"+P.userID+"\">"
        post += "(ID: <span class=\"hand\" title=\"Highlight posts by this ID\" style=\"background-color:"+P.userIDColor+";\"><a class=\"userID\">"+P.userID+"</a></span>)</span>"
        post += "<span title=\"United States\" class=\"flag flag-us\"></span></span>"
        post += "<span class=\"postTime\">"+parseTime(P.time)+"</span> "
        post += "<span class=\"postNumber\"><a href=\"#"+P.postID+"\" class=\"highlightThisPost\" id=\""+P.postID+"\">No. </a><a href=\"#\" class=\"quotePostNumber\" id=\""+P.postID+"\">"+P.postID+"</a></span>"
        post += "<a href=\"#\" class=\"report\" id=\"rp-"+P.postID+"\">  ▶ </a>"
        post += "<div class=\"reply hidden\" id=\"mrp-"+P.postID+"\" style=\"min-width:5%; height:2%;font-size:8px;position:relative;z-index:0\"><a class=\"report-link\" id=\"report-link-"+P.postID+" target=\"_blank\" href=\"/report/"+board+"/"+P.postID+"\">Report</a></div>"
        post += "</div>"
        if(P.fileSize){
            post += "<div class=\"file\"><div class=\"fileInfo\">File: <a href=\"/images/"+P.fileName+"\" target=\"_blank\" class=\"fileLink\">"+P.fileOriginalName+"</a>"
            var fs = P.fileSize
            if(fs<1000){
                post += "("+fs+" Bytes, "+P.fileDimensions+")";
            } else if(Math.floor(fs/1000 <= 1000)){
                post += "("+Math.floor(fs/1000)+" KB, "+P.fileDimensions+")";
            } else if(Math.floor(fs/1000 >= 1000)){
                post += "("+Math.floor(fs/1000000)+" MB, "+P.fileDimensions+")";
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

var updatePosts = (function(){
    var OP = $('div.OP').attr('id')
    var posts = $('div.post').map(function(){return this.id}).toArray()
    var biggest = Math.max(...posts)
    var board = $('.boardTitle').html().split('/')[1]
    var url = '/api/update/'+board+'/'+OP+'/'+biggest
    $.ajax({
        type: "GET",
        url: url,
        success: function(data){
            if(data!=""){
                renderPosts(data,'.thread',board)
                /* update thread metadata */
                var replies = $('.threadMetaData#replies').html()
                replies = Number(replies) + data.length
                var images = $('.threadMetaData#images').html()
                images = Number(images)
                var posters = $('.threadMetaData#posters').html()
                posters = Number(posters)
                $('.threadMetaData#replies').html(replies)
                for(var i=0;i<data.length;i++){
                    var d = data[i]
                    if(d.fileSize != undefined){
                        images += 1
                    }
                    if(i==data.length-1){
                        $('.threadMetaData#images').html(images)
                    }
                }                
                var IDs = []
                $('.userID').each(function(){
                    IDs.push($(this).html())
                })
                var unique = []
                for(var n=0;n<IDs.length;n++){
                    var current = IDs[n]
                    if(unique.indexOf(current) == -1){
                        unique.push(current)
                    }
                    if(n==IDs.length-1){
                        $('.threadMetaData#posters').html(unique.length)
                    }
                }
                $('div.post#'+biggest).css('border-bottom-color', 'red').css('border-bottom-width', 'initial')
            }
        }
    })
});

$(document).ready(function(){
        $(document).on('click',"a.highlightThisPost",(function(){
            var str = String(this)
            var post = str.split('#')[1]
            $('div.reply').removeClass('highlight')
            $('div.reply#'+post).addClass('highlight')
        }));

        $(document).on('click','.posteruid',(function(){
            var id = $(this).attr('class').split(' ')[1]
            $('div.reply').removeClass('highlight')
            $('.'+id).parent().parent().parent().addClass('highlight')
            $('.OP').removeClass('highlight')
            
        }));

        $(document).on('click','#update',(function(e){
            e.preventDefault();
            updatePosts();
        }));

        $(document).on('click','a.postLink',(function(){
            $('div.reply').removeClass('highlight')
            $('div.reply#'+post).addClass('highlight')
        }));

        $(document).on('click','a.quotePostNumber',(function(){
            var post = $(this).attr('id')
            $('textarea.text').val($('textarea.text').val()+'>>'+post+'\r\n');       
        }));

        $(document).on('click','input#delete',(function(){
            var targets = $('input.postDeletebox:checkbox:checked')
            var payload = []
            for(var i=0;i<targets.length;i++){
                var t = targets[i]
                var id = t.id.slice(7,)
                var fo = $('input.deleteImageOnly:checkbox:checked').attr('value')
                fo == undefined ? fo = false : ""; // Image file only
                var win = window.location.pathname
                var w = win.split('/') // /b/thread/7 or /boards/b/
                var OPs = $('div.OP').map(function(){return Number(this.id)}).toArray()
                var index = OPs.indexOf(id)
                var OP
                index != -1 ? OP = OPs[index] : OP = 0;
                var board = $('.boardTitle').html().split('/')[1]
                /*$.post('/'+board+'/delete',{board,id,fo,OP}, function(data,status){
                    console.log("Status: "+status);
                })
                */ 
                var obj = {
                    board: board,
                    id: id,
                    fo: fo,
                    OP: OP
                }
                payload.push(obj)
                if(i==targets.length-1){
                    $.post('/'+board+'/delete', {payload:payload}, function(data,status){
                        console.log(`Status: ${status}`)
                        console.log(data)
                        if(w.length==3){
                            location.reload();
                        } else if(w.length==4){
                            index == -1 ? location.reload() : location.href='/boards/'+w[1] 
                        }
                    })
                }
            }
        }));

        $(document).on('click','.report',(function(e) {
            e.preventDefault();
            var newTarget = '#m'+this.id
            console.log($(newTarget).html())
            $(newTarget).toggleClass('hidden')
        }));
})

$(window).on("scroll", function() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        $('div.post').css('border-bottom','1px solid #d9bfb7')
    }
});
