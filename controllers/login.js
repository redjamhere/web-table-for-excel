$(document).ready(() => {

  $('.error').hide()
  $('#preloader').hide()

  $('#login').on('keypress', function() {
    $('.error').hide()
  })
  $('#password').on('keypress', function() {
    $('.error').hide()
  })
  let i = 0
  function ajaxLogin() {
    $.ajax({
      url: 'http://10.221.75.105/login/login',
      type: 'post',
      data : {
        username: $('#login').val(),
        password: $('#password').val()
      },
      beforeSend: (xhr) => {
        $('#preloader').show()
      },
      success: (result) => {
        $('#preloader').show()
        if(result.length > 200) {
          window.open('http://10.221.75.105/', '_self')
        } else {
          $('#preloader').hide()
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