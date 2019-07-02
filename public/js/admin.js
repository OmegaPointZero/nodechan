$(document).ready(function(){
    $('#postByIP').click(function(e){
        console.log('at least I\'m trying')
        var obj = {}
        obj.board = $('#getUserByIPBoard').val();
        obj.IP = $('#getUserByIPAddress').val()
        $.ajax({
          type: "POST",
          url: '/api/users',
          data: obj,
          success: function(data){
            console.log(data)
            $('#pulledPostsByIP').html(JSON.stringify(data))
          }
        });
    });


})
