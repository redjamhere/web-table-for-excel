
$(document).ready(() => {
  $.ajax({
    url: 'http://loclhost:5000/check-users',
  })
  $('#l-btn').click(() => {
   $.ajax({
     url: 'http://localhost:5000/login',
     type: 'post',
     data : {
       username: 'admin1',
       password: 'admin1'
     },
     success: () => {
     }
   })
    $.ajax({
      url: 'http://localhost:5000/check-users',
      type: 'get',
      success: function(){
        console.log('loggined')
      }
    })
  })
})