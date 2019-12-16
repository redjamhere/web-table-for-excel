$(document).ready(() => {
  new WOW().init()
  
  $('.editer').hide()
  $('.list').hide()

  $('#n-back').click(() => {
    $.ajax({
      url: 'http://10.221.75.105/',
      type: 'get',
      success: () => {
        window.open('/', '_self')
      }
    })
  })

  $('.userlist-btn').click(() => {
    $('.usersList .list').show()
  })
})