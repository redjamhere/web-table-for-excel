$(document).ready(() => {

  $('.error').hide()

  $('#login').on('keypress', function() {
    $('.error').hide()
  })
  $('#password').on('keypress', function() {
    $('.error').hide()
  })
  
  function ajaxLogin() {
    $.ajax({
      url: 'http://10.221.75.105/login',
      type: 'post',
      data : {
        username: $('#login').val(),
        password: $('#password').val()
      },
      success: (result) => {
        if(result.length > 200) {
          window.open('http://10.221.75.105/', '_self')
        } else {
          $('#password').val('')
          $('.error').fadeIn('fast')
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