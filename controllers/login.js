$(document).ready(() => {

  function ajaxLogin() {
    $.ajax({
      url: 'http://10.221.75.105:5000/login',
      type: 'post',
      data : {
        username: $('#login').val(),
        password: $('#password').val()
      },
      success: (result) => {
        if(result.length > 200) {
          window.open('http://10.221.75.105:5000/', '_self')
        } else {
        }
      }
    })
  }

    $('#l-btn').click(() => {
      ajaxLogin()
    })
  
    $(document).on('keypress', function(e){
      if (e.which == 13) {
        ajaxLogin()
      }
    })


})