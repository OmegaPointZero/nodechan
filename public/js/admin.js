$(document).ready(function(){
    $('button#IP').click(function(e){
        var obj = {
            board: '',
            IP: ''
        }
        var obj.board= $('#getUserByIPBoard').val();
        var obj.IP = $('#getUserByIPAddress').val()
        $.ajax({
          type: "POST",
          url: '/api/users',
          data: obj,
          dataType: JSON,
          success: function(data){
            $('#pulledPostsByIP').html(data)
          }
        });
    });


})
