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
            var post = $(this).attr('href').slice(1)
            $('div.reply').removeClass('highlight')
            $('div.reply#'+post).addClass('highlight')
        });

        $('a.quotePostNumber').click(function(){
            var post = $(this).attr('id')
            $('textarea.text').val($('textarea.text').val()+'>>'+post+'\r\n');       
        })

        $('input#delete').click(function(){
            var id =$('input.postDeleteBox:checkbox:checked').attr('id')
            var fo = $('input.deleteImageOnly:checkbox:checked').attr('value')
            fo == undefined ? fo = false : "";
            var OP = window.location.pathname;
            OP = OP.split('/thread/')[1];
            var board = '<%=thisBoard.boardCode%>';
            $.post('/<%=thisBoard.boardCode%>/delete',{board,id,fo,OP}, function(data,status){
                console.log("Status: "+status);
            })
                location.reload();
        });

        $('.report').click(function(e) {
            e.preventDefault();
            var id = this.id;
            console.log(id);
            $('#m'+id).toggleClass('hidden')
        });

    })

