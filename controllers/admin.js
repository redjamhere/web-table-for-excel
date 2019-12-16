function doMarginTop(marginned, ul, direction) {
  let pixels = 0
  $(ul).filter(function(){
    pixels = $(this).children('li').length * 50
    if (direction == '+') 
      $(marginned).css('margin-top', `${pixels}px`)
    else
      $(marginned).css('margin-top', '0px')
  })
}

//ajax get all users data

const generateUsersList = function() {
  $.ajax({
    url: 'http://10.221.75.105/admin/userslist',
    type: 'post',
    success: (result) => {
      for(let i = 0; i < result.length; i++) {

        let li = `<li class="item${i}" id="${result[i].id}"></li>`
        let fullname = `<span class="text-item" id="user-standard-info">${result[i].Lastname} ${result[i].Firstname} ${result[i].Middlename}</span>`
        let duty = `<span id="user-position">${result[i].duty}</span>`

        $('.users-ul').append(li)
        $(`.item${i}`).append(fullname)
        $('#user-standard-info').append(duty)
      }
    }
  })
}

$(document).ready(() => {
  new WOW().init()
  
  generateUsersList()
  
  $('.editer').hide()
  $('.list').hide()
  $('.fa-sort-up').hide()

  $('#n-back').click(() => {
    $.ajax({
      url: 'http://10.221.75.105/',
      type: 'get',
      success: () => {
        window.open('/', '_self')
      }
    })
  })

  let userListStatus = 0

  $('#userlist-btn').click(() => {
    if (userListStatus == 0) {
      $('.usersList .list').show()
      $('.fa-sort-down').hide()
      $('.fa-sort-up').show()
      userListStatus++
      doMarginTop($('.departList'), $('.usersList ul'), '+')
    } else {
      $('.usersList .list').hide()
      $('.fa-sort-down').show()
      $('.fa-sort-up').hide()
      userListStatus--
      doMarginTop($('.departList'), $('.usersList ul'), '-')
    }
  })

  let editerStatus = 0

  $('.users-ul li').click(() => {
    if(editerStatus == 0) {
      $('.editer').show()
      editerStatus++
    } else {
      $('.editer').hide()
      editerStatus--
    }
  })

})  