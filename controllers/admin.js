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

const getChildCountInParent = (parent, child) => {
  let count
  $(parent).filter(function() {
    count = $(this).children(child).length
  })
  return count
}

const buildEditor = (currentUser, services, departs) => {

  $('#lastname-inp').val(currentUser.Lastname)
  $('#firstname-inp').val(currentUser.Firstname)
  $('#middlename-inp').val(currentUser.Middlename)
  $('#duty-inp').val(currentUser.duty)
  
  //detect depart

}

//ajax get all users data

const generateUsersList = function() {
  $.ajax({
    url: 'http://10.221.75.105/admin/userslist',
    type: 'post',
    success: (result) => {
      for(let i = 0; i < result.length; i++) {

        let li = `<li class="item${i}" id="${result[i].id}"></li>`
        let fullname = `<span class="text-item" id="user-standard-info">${result[i].Lastname} ${result[i].Firstname} ${result[i].Middlename} </span>`
        let duty = `<span id="user-position">${result[i].duty}</span>`

        $('.users-ul').append(li)
        $(`.item${i}`).append(fullname)
        $(`.item${i}`).append(duty)
      }
    } 
  })
}



$(document).ready(() => {
  // new WOW().init()
  
  //users info variables
  let users = []
  let currentUser

  //openclose statuses
  let editerStatus = 0
  let userListStatus = 0

  //get all user info
  $.ajax({
    url: 'http://10.221.75.105/admin/users',
    type: 'post',
    success: (result) => {
      users.push(result)
    }
  })

  generateUsersList()

  //generate departs in editer window

  $.ajax({
    url: 'http://10.221.75.105/admin/departs',
    type: 'post',
    success: (result) => {
      result.forEach(depart => {
        $('#depart-inp').append(`<option value="${depart.OtdelSmallName}">${depart.OtdelFullName}</option>`)
      });
    }
  })

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

  $('#userlist-btn').click(() => {
    if (userListStatus == 0) {
      $('.usersList .list').show('fade', 500)
      $('.users-ul').css('height', `${getChildCountInParent('.users-ul', 'li') * 50}`)
      $('.fa-sort-down').hide()
      $('.fa-sort-up').show()
      userListStatus++
    } else {
      $('.usersList .list').hide('fade', 500)
      $('.fa-sort-down').show()
      $('.fa-sort-up').hide()
      userListStatus--
    }
  })

  $('.users-ul').on('click', 'li', function() {
    for(let i = 0; i < users[0].length; i++) {
      if(users[0][i].id == $(this).attr('id')) {
        currentUser = users[0][i]
      }
    }
    if(editerStatus == 0) {
      $('.editer').show('fade', 400)
      buildEditor(currentUser)
      editerStatus++
    } else {
      $('.editer').hide('fade', 400)
      editerStatus--
    }

  })

  $('.close-warp .fa-times').click(() => {
    $('.editer').hide()
    editerStatus = 0
  })

})    