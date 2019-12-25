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

const buildEditor = (currentUser) => {
  $("#service-inp option").remove()
  $("#service-perm-inp option").remove()
  $("#depart-inp option").remove()
  $(".choose-depart-list li").remove()

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
            
            let li = `<li><label><input type="checkbox" name="${depart.Shortname}"/><span class="choose-depart-text">${depart.Fullname}</span></label></li>`
            $('.choose-depart-list').append(li)
          });
        }
      })
    }
  })


  $('#lastname-inp').val(currentUser.Lastname)
  $('#firstname-inp').val(currentUser.Firstname)
  $('#middlename-inp').val(currentUser.Middlename)
  $('#duty-inp').val(currentUser.Duty)
  
  //detect depart

}

//ajax get all users data

const generateUsersList = function() {
  
  $.ajax({
    url: `http://${ip}/admin/userslist`,
    type: 'post',
    success: (result) => {
      for(let i = 0; i < result.length; i++) {

        let li = `<li class="item${i}" id="${result[i].id}"></li>`
        let fullname = `<span class="text-item" id="user-standard-info">${result[i].Lastname} ${result[i].Firstname} ${result[i].Middlename} </span>`
        let duty = `<span id="user-position">${result[i].Duty}</span>`

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

  //get all user info
  $.ajax({
    url: `http://${ip}/admin/users`,
    type: 'post',
    success: (result) => {
      users.push(result)
    }
  })

  generateUsersList()

  //generate departs in editer window

  $('#service-inp').on('change', function(){
    $.ajax({
      url: `http://${ip}/admin/departs`,
      type: 'post',
      data: {service: $(this).children("option:selected").val()},
      beforeSend: (xhr) => {
        $('#preloader-depart').show()
        $('.depart-info').hide()
      },
      success: (result) => {
        $('#preloader-depart').hide()
        $('.depart-info').show()

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
        $('.view-permissions').hide()
      },
      success: (result) => {
        $('#preloader-depart-perm').hide()
        $('.view-permissions').show()
        $(".choose-depart-list li").remove()
        result.forEach(depart => {
          let li = `<li><label><input type="checkbox" name="${depart.Shortname}"/><span class="choose-depart-text">${depart.Fullname}</span></label></li>`
          $('.choose-depart-list').append(li)
        })
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
      $('.editer').show('slide', 400)
      buildEditor(currentUser)
      editerStatus++
    } else {
      $('.editer').hide('slide', 400)
      editerStatus--
    }

  })

  $('.fa-times').click(() => {
    $('.editer').hide('fade', 400)
    editerStatus--
  })

})    