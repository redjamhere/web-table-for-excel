const ip = '10.221.75.105'

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

const generateCheckedDeparts = (departs, ul) => {
  $(`${ul} li label input`).each(function(i) {
    if(departs.indexOf(`${parseInt($(this).attr('id'))}`) >= 0) {
      $(this).attr('checked', 'checked')
    }
  })
}

const getAllUsers = () => {

}


const buildEditor = (currentUser, departs) => {
  if(!currentUser) {
    $('#saveUserSettings').hide()
    $('#deleteUser-btn').hide()
    $('#addUser-btn').show()
  } else {
    $('#saveUserSettings').show()
    $('#deleteUser-btn').show()
    $('#addUser-btn').hide()
  }

  $("#service-inp option").remove()
  $("#service-perm-inp option").remove()
  $("#depart-inp option").remove()
  $(".choose-depart-list li").remove()
  $('#username-inp').val('')

  $.ajax({
    url: `http://${ip}/admin/services`,
    type: 'post',
    beforeSend: (xhr) => {
      $('#preloader-service').show()
      $('#preloader-service-perm').show()
    },
    success: (result) => {
      $('#preloader-service').hide()
      $('#preloader-service-perm').hide()
      result.forEach(service => {
        if(service.ShortName == currentUser.ServiceName){
          $('#service-inp').append(`<option selected value="${service.ShortName}">${service.FullName}</option>`)
          $('#service-perm-inp').append(`<option selected value="${service.ShortName}">${service.FullName}</option>`)
        } else {
          $('#service-inp').append(`<option value="${service.ShortName}">${service.FullName}</option>`)
          $('#service-perm-inp').append(`<option value="${service.ShortName}">${service.FullName}</option>`)
        }       
      });
      $.ajax({
        url: `http://${ip}/admin/departs`,
        type: 'post',
        data: {service: $('#service-inp').children('option:selected').val()},
        beforeSend: (xhr) => {
          $('#preloader-depart').show()
          $('#preloader-depart-perm').show()
        },
        success: (result) => {
          $('#preloader-depart').hide()
          $('#preloader-depart-perm').hide()
          result.forEach(depart => {
            $('#depart-inp').append(`<option value="${depart.Shortname}">${depart.Fullname}</option>`)
            
            let li = `<li id="${depart.id}-li"><label><input type="checkbox" id="${depart.id}-check" class="depart-checkbox" name="${depart.Shortname}"/><span class="choose-depart-text">${depart.Fullname}</span></label></li>`
            $('.choose-depart-list').append(li)
          });
          generateCheckedDeparts(departs, '.choose-depart-list')
        }
      })
    }
  })

  if(currentUser.Readwrite) {
    $('#rwPerm-inp').val('1')
  } else {
    $('#rwPerm-inp').val('0')
  }

  $('#username-inp').val(currentUser.username)
  $('#password-inp').val(currentUser.password)

  $('#lastname-inp').val(currentUser.Lastname)
  $('#firstname-inp').val(currentUser.Firstname)
  $('#middle-inp').val(currentUser.Middlename)
  $('#duty-inp').val(currentUser.Duty)
  
  //detect depart

}

const saveUserData = (currentUser, departs) => {
  const savingData = {
    Firstname: $('#firstname-inp').val(),
    Lastname: $('#lastname-inp').val(),
    Middlename: $('#middle-inp').val(),
    username: $('#username-inp').val(),
    password: $('#password-inp').val(),
    Readwrite: $('#rwPerm-inp').children('option:selected').val(),
    DepartViewList: departs.join(', '),
    Depart: $('#depart-inp').children('option:selected').val(),
    Service: $('#service-inp').children('option:selected').val(),
    Duty: $('#duty-inp').val()
  }

  $.ajax({
    url: `http://${ip}/admin/userdatasave`,
    type: 'post',
    data: {
      saves: savingData,
      user_id: currentUser.id
    },
    success: (result) => {
      alert(result)
    }
  })
}

const addUserData = (departs) => {
  const addingData = [
    $('#firstname-inp').val(),
    $('#lastname-inp').val(),
    $('#middle-inp').val(),
    $('#username-inp').val(),
    $('#password-inp').val(),
    $('#rwPerm-inp').children('option:selected').val(),
    departs.join(', '),
    $('#depart-inp').children('option:selected').val(),
    $('#service-inp').children('option:selected').val(),
    $('#duty-inp').val()
  ]

  $.ajax({
    url: `http://${ip}/admin/userdataadd`,
    type: 'post',
    data: {
      adds: addingData,
    },
    success: (result) => {
      alert(result)
      $('.editer').hide()
      $('.users-ul .user-item').remove()
      generateUsersList()
    }
  })
}

const deleteUser = (currentUser) => {
  $.ajax({
    url: `http://${ip}/admin/deleteuser`,
    type: 'post',
    data: {
      user_id: currentUser.id
    },
    success: (result) => {
      alert(result)
      $('.editer').hide()
      $('.users-ul .user-item').remove()
      generateUsersList()
    }
  })
}

//ajax get all users data

const generateUsersList = function() {
  
  $.ajax({
    url: `http://${ip}/admin/userslist`,
    type: 'post',
    beforeSend: (xhr) => {
      $('.users-ul').hide()
      $('#preloader-userlist').show()
    },
    success: (result) => {
      $('.users-ul').show()
      $('#preloader-userlist').hide()
      for(let i = 0; i < result.length; i++) {
        if(result[i].GodMode == 0) {
          let li = `<li class="item${i} user-item" id="${result[i].id}"></li>`
          let fullname = `<span class="text-item" id="user-standard-info">${result[i].Lastname} ${result[i].Firstname} ${result[i].Middlename} </span>`
          let duty = `<span id="user-position">${result[i].Duty}</span>`
          $('.users-ul').append(li)
          $(`.item${i}`).append(fullname)
          $(`.item${i}`).append(duty)
        }
      }
    } 
  })
}

const updateUsers = () => {
  return  $.ajax({
    url: `http://${ip}/admin/users`,
    type: 'post',
    cache: false,
    processData: false,
    contentType: false,
    async: false,
  })
}



$(document).ready(() => {
  // new WOW().init()
  //users info variables
  $('#preloader-userlist').hide()
  $('#addUser-btn').hide()
  $('#user-filter').hide()
  $('#preloader-service').hide()
  $('#preloader-depart').hide()
  $('#preloader-service-perm').hide()
  $('#preloader-depart-perm').hide()

  let users = []
  let departs = []
  let services = []

  let currentUser

  //openclose statuses
  let editerStatus = 0
  let userListStatus = 0

  users.push(JSON.parse(updateUsers().responseText))
  //get all user info
  generateUsersList()

  //generate departs in editer window

  $('#service-inp').on('change', function(){
    $.ajax({
      url: `http://${ip}/admin/departs`,
      type: 'post',
      data: {service: $(this).children("option:selected").val()},
      beforeSend: (xhr) => {
        $('#preloader-depart').show()
        $('.depart-info label').hide()
        $('.depart-info select').hide()
      },
      success: (result) => {
        $('#preloader-depart').hide()
        $('.depart-info label').show()
        $('.depart-info select').show()
        $("#depart-inp option").remove()
        result.forEach(depart => {
          $('#depart-inp').append(`<option value="${depart.Shortname}">${depart.Fullname}</option>`)
        });
      }
    })
  })


  $('#service-perm-inp').on('change', function(){
    $.ajax({
      url: `http://${ip}/admin/departs`,
      type: 'post',
      data: {service: $(this).children("option:selected").val()},
      beforeSend: (xhr) => {
        $('#preloader-depart-perm').show()
        $('.view-permissions label').hide()
        $('.view-permissions ul').hide()
      },
      success: (result) => {
        $('#preloader-depart-perm').hide()
        $('.view-permissions label').show()
        $('.view-permissions ul').show()

        $(".choose-depart-list li").remove()
        result.forEach(depart => {
          let li = `<li id="${depart.id}-li"><label><input type="checkbox" id="${depart.id}" name="${depart.Shortname}"/><span class="choose-depart-text">${depart.Fullname}</span></label></li>`
          $('.choose-depart-list').append(li)
        })
        generateCheckedDeparts(departs, '.choose-depart-list')
      }
    })
  })

  $('.editer').hide()
  $('.list').hide()
  $('.fa-sort-up').hide()

  $('#n-back').click(() => {
    $.ajax({
      url: `http://${ip}/`,
      type: 'get',
      success: () => {
        window.open('/', '_self')
      }
    })
  })

  $('#userlist-btn').click(() => {
    if (userListStatus == 0) {
      $('.usersList .list').show('fade', 300)
      $('.users-ul').css('margin-bottom', `${getChildCountInParent('.users-ul', 'li') * 50}`)
      $('.fa-sort-down').hide()
      $('.fa-sort-up').show()
      $('#user-filter').show()
      userListStatus++
    } else {
      $('.usersList .list').hide('fade', 300)
      $('.fa-sort-down').show()
      $('.fa-sort-up').hide()
      $('#user-filter').hide()
      userListStatus--
    }
  })

  $('.users-ul').on('click', 'li', function() {
    if($(this).attr('class') == 'item-add') {
        $('.editer').show('slide', {direction: 'right'}, 400)
        departs = []
        buildEditor(0, departs)
    } else {
      for(let i = 0; i < users[0].length; i++) {
        if(users[0][i].id == $(this).attr('id')) {
          currentUser = users[0][i]
          departs = currentUser.DepartViewPermission.split(', ')
        }
      } 
        $('.editer').show('slide', {direction: 'right'}, 400)
        buildEditor(currentUser, departs)
    }
  })

  $('.close-btn').click(() => {
    $('.editer').hide('slide', {direction: 'right'}, 400)
  })

  $('.choose-depart-list').on('change', 'input', function() {
    if ($(this).is(':checked')) {
      if (departs.indexOf(`${parseInt($(this).attr('id'))}`) < 0) {
        departs.push(`${parseInt($(this).attr('id'))}`)
      }
    } else {
      if (departs.indexOf(`${parseInt($(this).attr('id'))}`) >= 0) {
        departs.splice(departs.indexOf(`${parseInt($(this).attr('id'))}`), 1)
      }
    }
  })

  $('#saveUserSettings').click(() => {
    saveUserData(currentUser, departs)
    users.pop()
    users.push(JSON.parse(updateUsers().responseText))
  })

  $('#addUser-btn').click(() => {
    addUserData(departs)
    users.pop()
    users.push(JSON.parse(updateUsers().responseText))
  })

  $('#deleteUser-btn').click(() => {
    deleteUser(currentUser)
    users.pop()
    users.push(JSON.parse(updateUsers().responseText))
  })

  $('#user-filter').keyup(function () {

    var rex = new RegExp('.*(' + $(this).val()+')+.*', 'i');
    $('.users-ul li').hide();
    $('.users-ul li').filter(function () {
        return rex.test($(this).text().replace(/[^\wа-яё]+/gi, ""));
    }).show();
    
  })

  $('.logout').click(() => {
    $.ajax({
      url: `http://${ip}/admin/logout`,
      type: "post",
      success: () => {
        window.open('/login', '_self')
      }
    })
  })
})    