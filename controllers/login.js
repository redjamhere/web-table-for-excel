$(document).ready(() => {
  $('#l-btn').click(() => {
   $.ajax({
     url: 'http://localhost:5000/login',
     type: 'post',
     data : {
       username: 'admin',
       password: $('#password').val()
     },
     success: () => {
      
     }
   })
  })
})