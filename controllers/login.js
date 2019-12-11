$(document).ready(() => {
  $.ajax({
    url: 'http://localhost:5000/get-cookie',
    type: 'post',
    success: function(result) {
      console.log(result)
    }
  })
  $('#l-btn').click(() => {
   $.ajax({
     url: 'http://localhost:5000/login',
     type: 'post',
     data : {
       username: $('#login').val(),
       password: $('#password').val()
     },
     success: (result) => {
       if(result.length > 200) {
         window.open('http://localhost:5000/', '_self')
       } else {
       }
     }
   })
  })
})