﻿const ip = '10.221.75.7'

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
  console.log(count)
  return count
}

const generateCheckedDeparts = (departs, ul) => {
  $(`${ul} li label input`).each(function(i) {
    if(departs.indexOf(`${parseInt($(this).attr('id'))}`) >= 0) {
      $(this).attr('checked', 'checked')
    }
  })
}


const buildEditor = (currentUser, departs) => {
  if(!currentUser) {
    $('#saveUserSettings').hide()
    $('#deleteUser-btn').hide()
    $('#addUser-btn').show()
	$('#password-inp').val("123qweASD")
  } else {
    $('#saveUserSettings').show()
    $('#deleteUser-btn').show()
    $('#addUser-btn').hide()
	$('#password-inp').val(currentUser.password)
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

  $('#lastname-inp').val(currentUser.Lastname)
  $('#firstname-inp').val(currentUser.Firstname)
  $('#middle-inp').val(currentUser.Middlename)
  $('#duty-inp').val(currentUser.Duty)
  
  //detect depart

}

const buildServiceEditor = (currentService) => {
  generateDepartList(currentService)
}

const saveUserData = (departs) => {
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
  return savingData
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
  return addingData
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
          let li = `<li class="item${i}-user user-item" id="${result[i].id}"></li>`
          let fullname = `<span class="text-item" id="user-standard-info">${result[i].Lastname} ${result[i].Firstname} ${result[i].Middlename} </span>`
          let duty = `<span id="user-position">${result[i].Duty}</span>`
          $('.users-ul').append(li)
          $(`.item${i}-user`).append(fullname)
          $(`.item${i}-user`).append(duty)
        }
      }
    } 
  })
}

const generateServiceList = function() {
  $.ajax({
    url: `http://${ip}/admin/services`,
    type: 'post',
    beforeSend: (xhr) => {
      $('.service-ul').hide()
      $('#preloader-servicelist').show()
    },
    success: (result) => {
      $('.service-ul li').remove()
      $('.service-ul').append('<li class="item-add-service"></li>')
      $('.item-add-service').append('<span class="text-item" id="addService"><i class="fas fa-plus"></i> Добавить сервис</span>')
      $('.service-ul').show()
      $('#preloader-servicelist').hide()
      for (let i = 0; i < result.length; i++) {
        let li = `<li class="item${i}-service service-item" id="${result[i].id}"></li>`
        let serviceName = `<span class="text-item" id="service-standard-info">${result[i].FullName}</span>`
        $('.service-ul').append(li)
        $(`.item${i}-service`).append(serviceName)
      }
    }
  })
}

const generateDepartList = (currentService) => {
  $.ajax({
    url: `http://${ip}/admin/departs`,
    type: 'post',
    data: {
      service: currentService.ShortName
    },
    beforeSend: (xhr) => {
      $('#preloader-departlist').show()
      $('.departs-list').hide()
    },
    success: (result) => {
      $('#preloader-departlist').hide()
      $('.departs-list').attr('service', currentService.ShortName)
      $('.departs-list').show()
      $('.departs-list li').remove()
      $('.departs-list .departNull').remove()
      if(result.length === 0) {
        $('.departs-list').append('<span class="departNull">Нет данный для отображения</span>')
      } else {
        result.forEach(depart => {
          let li = `<li class="${depart.Shortname} depart-item" id="${depart.id}"></li>`
          let departName = `<span class="${depart.Shortname}-span">${depart.Fullname}</span>`
          let departDelete = `<div class="delDepart"><i class="fas fa-trash-alt"></i></div>`
          $('.departs-list').append(li)
          $(`.${depart.Shortname}`).append(`<div class="${depart.Shortname}-warp depart-display-info"></div>`)
          $(`.${depart.Shortname}-warp`).append(departName)
          $(`.${depart.Shortname}-warp`).append(departDelete)
        })
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

const updateServices = () => {
  return  $.ajax({
    url: `http://${ip}/admin/services`,
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
  $('#addUser-btn').hide()
  $('#user-filter').hide()
  $('#service-filter').hide()
  $('.mini-preloader').hide()
  $('#preloader').hide()
	
  let users = []
  let departs = []
  let services = []

  let currentUser
  let currentService

  //openclose statuses
  let userListStatus = 0
  let serviceListStatus = 0

  users.push(JSON.parse(updateUsers().responseText))
  services.push(JSON.parse(updateServices().responseText))
  
  //get all user info
  generateUsersList()
  generateServiceList()
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
  $('.service-editer').hide()
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
      $('.usersList').css('height', `${getChildCountInParent('.users-ul', 'li') * 50 + 110}`)
      $('.usersList .fa-sort-down').hide()
      $('.usersList .fa-sort-up').show()
      $('#user-filter').show()
      userListStatus++
    } else {
      $('.usersList .list').hide('fade', 300)
      $('.usersList').css('height', `50`)
      $('.fa-sort-down').show()
      $('.fa-sort-up').hide()
      $('#user-filter').hide()
      userListStatus--
    }
  })

  $('#serviceList-btn').click(() => {
    if (serviceListStatus == 0) {
      $('.serviceList .list').show('fade', 300)
      $('.service-ul').css('margin-bottom', `${getChildCountInParent('.users-ul', 'li') * 50}`)
      $('.serviceList .fa-sort-down').hide()
      $('.serviceList .fa-sort-up').show()
      $('#service-filter').show()
      serviceListStatus++
    } else {
      $('.serviceList .list').hide('fade', 300)
      $('.fa-sort-down').show()
      $('.fa-sort-up').hide()
      $('#service-filter').hide()
      serviceListStatus--
    }
  })

  $('.users-ul').on('click', 'li', function() {
    $('.users-ul li').removeClass('active-li')
    if($(this).attr('class') == 'item-add') {
		$('.service-ul li').removeClass('active-li')
        $('.service-editer').hide('slide', {direction: 'right'}, 400)
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
        $(this).addClass('active-li')
		
		$('.service-ul li').removeClass('active-li')
        $('.service-editer').hide('slide', {direction: 'right'}, 400)
        $('.editer').show('slide', {direction: 'right'}, 400)
		
        buildEditor(currentUser, departs)
    }
  })

  $('.service-ul').on('click', 'li', function() {
    $('.service-ul li').removeClass('active-li')

    if($(this).attr('class') == 'item-add-service') {
      $(this).hide()
      let li = '<li class="addService-li service-item"></li>'
      let input = `<input type="text" id="addService-inp" class="form-control" placeholder="Введите название сервиса">`
      let controls = `<div class="addService-control"></div>`
      let cancelBtn = `<button type="button" id="addService-cancel" class="btn btn-primary">Отмена</button>`
      let addBtn = `<button type="button" id="addService-add" class="btn btn-success">Добавить</button>`
      $('.service-ul').prepend(li)
      $('.addService-li').append(input)
      $('.addService-li').append(controls)
      $('.addService-control').append(cancelBtn)
      $('.addService-control').append(addBtn)
	
    } else if ( !$(this).hasClass('addService-li') ) {

      for(let i = 0; i < services[0].length; i++) {
        if(services[0][i].id == $(this).attr('id')) {
          currentService = services[0][i]
        }
      } 
        $(this).addClass('active-li')
		
		$('.users-ul li').removeClass('active-li')
	    $('.editer').hide('slide', {direction: 'right'}, 400)
        
		$('.service-editer').show('slide', {direction: 'right'}, 400)
        buildServiceEditor(currentService)
    } 
  })

  $('.service-ul').on('click', '#addService-add', function() {
    $.ajax({
      url: `http://${ip}/admin/add-service`,
      type: 'post',
      data: {
        serviceName: $('#addService-inp').val()
      },
      success: (result) => {
        alert(result)
        services.pop()
        services.push(JSON.parse(updateServices().responseText))
        generateServiceList()
      }
    })
  })

  $('.service-ul').on('click', '#addService-cancel', function() {
    $('.item-add-service').show()
    $('.addService-li').remove()
  })


  $('.departs-list').on('click', '.depart-display-info', function() {
    if($(this).hasClass('active-dep')) {
      $(this).removeClass('active-dep')
      $(`.depart-li-editor`).remove()
    } else {
      $(`.depart-li-editor`).remove()
      $('.depart-display-info').removeClass('active-dep')
      $(this).addClass('active-dep')
      let liClass = $(this).parent().attr('class').split(' ')[0]
      text = $(`.${liClass}-span`).text()
      $(this).parent().append(`<div class="depart-li-editor"><input type="text" class="depart-editor-inp form-control" id="${$(this).attr('class')}-inp" value="${text}"/><button type="button" class="btn btn-success" id="saveDepart">Сохранить</button></div>`)
    }  
  })

  $('#add-depart').click(() => {
    $.ajax({
      url: `http://${ip}/admin/add-depart`,
      type: 'post',
      data: {
        serviceName: $('.departs-list').attr('service')
      },
      success: (result) => {
        alert(result)
        generateDepartList(currentService)
      }
    })
  })

  $('.departs-list').on('click', '#saveDepart', function() {
    if (!$('.depart-editor-inp').val()) {
      alert('Поле должно быть заполнено!')
    } else {
      $.post({
        url: `http://${ip}/admin/save-depart`,
        data: {
          depId: $(this).parent().parent().attr('id'),
          newName: $('.depart-editor-inp').val()
        },
        success: (result) => {
          alert(result)
          $('.depart-li-editor').remove()
          $('.depart-display-info').removeClass('active-dep')
          generateDepartList(currentService)
        }
      })
    }
  })

  $('.departs-list').on('click', '.delDepart', function() {
    if(window.confirm('Вы точно хотите удалить службу?')){
      $.post({
        url: `http://${ip}/admin/delete-depart`,
        data: {
          depId: $(this).parent().parent().attr('id'),
          departName: $(this).parent().parent().attr('class').split(' ')[0]
        },
        success: (result) => {
          alert(result)
          $('.depart-li-editor').remove()
          $('.depart-display-info').removeClass('active-dep')
          generateDepartList(currentService)
        }
      })
    }
  })

  $('#delete-service').click(() => {
    if(window.confirm('Вы точно хотите удалить сервис?')) {
      $.post({
        url: `http://${ip}/admin/delete-service`,
        data: {
          serviceId: $('.active-li').attr('id')
        },
        success: (result) => {
          alert(result)
          $('.service-editer').hide()
          $('.departs-list').attr('service', '')
          generateServiceList()
        }
      })
    }
  })

  $('.close-userdata-btn').click(() => {
    $('.users-ul li').removeClass('active-li')
    $('.editer').hide('slide', {direction: 'right'}, 400)
  })
  $('.close-servicedata-btn').click(() => {
    $('.service-ul li').removeClass('active-li')
    $('.service-editer').hide('slide', {direction: 'right'}, 400)
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
    let newData = saveUserData(departs)

    $.ajax({
      url: `http://${ip}/admin/userdatasave`,
      type: 'post',
      data: {
        saves: newData,
        user_id: currentUser.id
      },
      success: (result) => {
        users.pop()
        users.push(JSON.parse(updateUsers().responseText))
        alert(result)
      }
    })

  })

  $('#addUser-btn').click(() => {
    let newData = addUserData(departs)

    $.ajax({
      url: `http://${ip}/admin/userdataadd`,
      type: 'post',
      data: {
        adds: newData,
      },
      success: (result) => {
        if(result == 'Имя пользователя занято') {
          alert(result)
        } else {           
          users.pop()
          users.push(JSON.parse(updateUsers().responseText))
          alert(result)
          $('.editer').hide()
          $('.users-ul .user-item').remove()
          generateUsersList()
		  $('.usersList').css('height', `${getChildCountInParent('.users-ul', 'li') + 50}`)
        }
      }
    })
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

  $('#service-filter').keyup(function () {

    var rex = new RegExp('.*(' + $(this).val()+')+.*', 'i');
    $('.service-ul li').hide();
    $('.service-ul li').filter(function () {
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