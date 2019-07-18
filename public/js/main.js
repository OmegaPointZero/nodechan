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
            var b = $('.boardTitle').html()
            var board = b.split('/')[1]
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

