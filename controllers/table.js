function createTable (result) {
          // insert rows in table
          let j = 1;
          for (let i = 0; i < result.length; i++){
            var str = ''
            for(let key in result[i]) {
              if (key != 'id') {
                if (result[i][key] == '_') {
                  str += 
                  `<td align="left" id="${result[i].id}" class="${key}">
                    <span id="${result[i].id}${key}-text"></span>
                    <textarea style="display:none" type="text" id="${result[i].id}${key}-inp" class="${key}-inp"></textarea>                
                  </td>`
                  
                } else {
                  str += `<td align="left" id="${result[i].id}" class="${key}"><span id="${result[i].id}${key}-text">${result[i][key]}</span><textarea style="display:none" id="${result[i].id}${key}-inp" class="${key}-inp">${result[i][key]}</textarea></td>`
                }
              }
            }
            var newRow = 
            `<tr id="${result[i].id}tr" class="${j}tr">
              <th scope="row" id="delrow" class="${j}th">${j}</th>
              ${str}
            </tr>`
            $("#t-tbl").append(newRow)
            j++
          }
}

function createTree (parents, childes, permissions) {
  let p = ''
  let c = ''
  for(let i = 0; i < parents.length; i++) {
    p += `<li id="${parents[i].id}" class="${parents[i].short}" type="service" level="${parents[i].level}"><i class="fas fa-receipt" style="margin-right: 20px"></i> ${parents[i].text}`
    if(parents[i].children) {
      p += '<ul>'
      for(let j = 0; j < childes.length; j++) {
        if (childes[j].parent == parents[i].id) {
          if(permissions.departView <= childes[j].level)
            c += `<li id="${childes[j].id}" class="${childes[j].short}" type="depart" disable="false" level="${childes[i].level}"><i class="fas fa-table" style="margin-right: 20px"></i> ${childes[j].text}</li>`
          else
            c += `<li id="${childes[j].id}" class="${childes[j].short}" style="color: gray;" type="depart" disable="true" level="${childes[i].level}"><i class="fas fa-table" style="margin-right: 20px"></i> ${childes[j].text}</li>`
        }
      }
      p += c
      c = ''
      p += '</ul>'
      p += '</li>'
    } else {

    }
  }
  $('.treeview').append(p)
}

function getTable() {
  $.ajax({
    url: 'http://10.221.75.105/table/get-table',
    type: 'post',
    success: (result) => {
      if (result == 'No rows') {
        $('.no-rows').show()
        $('.tablewarp').hide()
      } else {
        createTable(result)
      }
    }
  })
}

$(document).ready(() => {

  $('.no-rows').hide()
  $('.w-modal').hide()
  $('.w-modal-file').hide()
  $('.n-save').hide()
  $('.n-undo').hide()
  $('.n-adm').hide()
  $('#preloader').hide()
  $('.admin-warp').hide()

  let permissions

  $.ajax({
    url: 'http://10.221.75.105/table/getperm',
    type: 'POST',
    success: (result) => {
      permissions = result
      if(!permissions.readWrite) {
        $('.n-add').css('background-color', '#c0392b')
        $('.n-add').text('Только чтение')
        $('.n-add').attr('disabled', 'disabled')
        $('.upex').hide()
      }
      if(!permissions.departView && !permissions.serviceView) {
        $.ajax({
          url: 'http://10.221.75.105/table/supercheck',
          type: 'post',
          success: (result) => {
            if(result) {
              $('.admin-warp').show()
            }
          }
        })
      }
    }
  })

  $('.pagewarp').css('grid-template-columns', '0px, 1fr')
  // get data for table
  $.ajax({
    url: 'http://10.221.75.105/table/get-table',
    type: 'post',
    beforeSend: (xhr) => { $('#preloader').show() },
    success: (result) => {
      $('#preloader').hide()
      if (result == 'No rows') {
        $('.no-rows').show()
        $('.tablewarp').hide()
      } else {
        createTable(result)
      }
    }
  })

  $('.n-adm').click(() => {
    $.ajax({
      url: 'http://10.221.75.105/admin',
      type: 'get',
      success: (result) => {
        window.open('/admin', '_self')
      }
    })
  })

  // change data in table
  var arr = []

  var getUnique = (arr) => {
    var tmp = [];
    for(var i = 0; i < arr.length; i++){
        if(tmp.indexOf(arr[i]) == -1){
        tmp.push(arr[i]);
        }
    }
    return tmp;
  }

  $("tbody").on('click', 'td', function (event) {
    if(permissions.readWrite) {
      $('tbody span').show()
      $('tbody textarea').hide()

      var span = $($(event.currentTarget).children()[0])
      var input = $($(event.currentTarget).children()[1])

      span.hide()
      input.show()
      
      $this = this

      input.change(function () {
        var oldText = span.text()
        span.text($(this).val())
        $('tbody span').show()
        $('tbody textarea').hide()

        obj = {
          'tdId': $($this).attr('id'),
          'tdClass': $($this).attr('class'),
          'textArea': $($($this).children()[1]).attr('id'),
          'span': $($($this).children()[0]).attr('id'),
          'spanText': span.text(),
          'oldText': oldText
        }


        arr.push(JSON.stringify(obj))

        $('.n-save').show()
        $('.n-undo').show()
      })

      input.click((event) => {
        event.stopPropagation()
      })

      $("body").click(function(event){
        if(event.target.nodeName != 'SPAN' && event.target.nodeName != 'TD' && event.target.nodeName != 'TEXTAREA') {
          $($($this).children()[0]).show()
          $($($this).children()[1]).hide()
        }
      })
    
      $(document).keyup(function(e) {
        if (e.keyCode === 27) {
          $($($this).children()[0]).show()
          $($($this).children()[1]).hide()
        }
      })
    } else {
      alert('Недостаточно прав')
    }
  })

  let delrows = []
  let delrowsFront = []

    $('tbody').on('mouseenter', '#delrow',
    function() {
      localStorage['rowId'] = $(this).text()
      $(this).text('Удалить')
      $(this).css('color', '#e74c3c')
    })
  
    $('tbody').on('mouseout', '#delrow', 
      function() {
        $(this).text(localStorage['rowId'])
        $(this).css('color', 'black')
    })

    $('tbody').on('click', '#delrow', function() {
      if (permissions.readWrite) {
        $(`.${localStorage['rowId']}tr`).fadeOut('fast')
        let rowId = $(`.${localStorage['rowId']}th`).parent('tr').attr('id')
        delrows.push(parseInt(rowId))
        delrowsFront.push($(`.${localStorage['rowId']}tr`).attr('class'))
        localStorage.removeItem('rowId')
        $('.n-save').show()
        $('.n-undo').show()
      } else {
        alert('Недостаточно прав')
      }

    })

  $('.n-save').click(() => {
    if (window.confirm("Сохранить изменения?")) { 
      if(arr.length > 0) {
        arr = getUnique(arr)
        tmp = []
        for (let i = 0; i < arr.length; i++) {
          tmp.push(JSON.parse(arr[i]))
        }
          
        $.ajax({
          url: 'http://10.221.75.105/table/change-data',
          type: 'post',
          data: {
            datas: tmp,
          },
          beforeSend: (xhr) => { $('#preloader').show() },
          success: (result) => {
            $('#preloader').hide()
            arr = []
            $('.n-save').hide()
            $('.n-undo').hide()
            alert('Изменения успешно сохранены')
          }
        })
      }
      if (delrows.length > 0) {
        $.ajax({
          url: 'http://10.221.75.105/table/delete-row',
          type: 'post',
          data: {
            datas: delrows,
          },
          beforeSend: (xhr) => { $('#preloader').show() },
          success: (result) => {
            $('#preloader').hide()
            delrows = []
            $('.n-save').hide()
            $('.n-undo').hide()
            $('tbody > tr').remove()
            getTable()
            alert('Записи удалены')
          }
        })
      }
    }
  })

  $('.n-undo').click(() => {

      if(delrows.length > 0) {
        console.log(delrowsFront)
        console.log(delrows)
        let last = delrows.length - 1
        $(`.${delrowsFront[last]} th`).text(`${parseInt(delrowsFront[last])}`)
        $(`.${delrowsFront[last]}`).fadeIn('fast')
        delrows.pop()
        delrowsFront.pop()
      } else {
        $('.n-undo').hide()
        $('.n-save').hide()
      }

      arr = getUnique(arr)
      tmp = []
      for (let i = 0; i < arr.length; i++) {
        tmp.push(JSON.parse(arr[i]))
      }
      var indent = tmp.length - 1
      $(`#${tmp[indent].span}`).text(`${tmp[indent].oldText}`)
      arr.pop()
      if (arr.length == 0) {
        $('.n-undo').hide()
        $('.n-save').hide()
      }
  })  
  
  $('.n-add').click(() => {
    if(permissions.readWrite) {
      $.ajax({
        url: 'http://10.221.75.105/table/add-data',
        type: 'post',
        success: (result) => {
            if(arr.length > 0) {
              arr = getUnique(arr)
              tmp = []
              for (let i = 0; i < arr.length; i++) {
                tmp.push(JSON.parse(arr[i]))
              }
                
              $.ajax({
                url: 'http://10.221.75.105/table/change-data',
                type: 'post',
                data: {
                  datas: tmp,
                },
                success: (result) => {
                  arr = []
                  $('.n-save').hide()
                  $('.n-undo').hide()
                  $('tbody > tr').remove()
                  getTable()
                }
              })
            }
          $('tbody > tr').remove()
          getTable()
        }
      })
    }
  })
// requset upladExcel

  var files
  $('#upfile').change(function() {
    files = this.files
  })

  $('#upfile-btn').click(function(event) {
    if(permissions.readWrite) {
      event.stopPropagation()    
      event.preventDefault()
  
      var data = new FormData()
      $.each(files, function(key, value) {
        data.append(key, value)
      })
      
      function getResponse(data) {
        return  $.ajax({
          url: 'http://10.221.75.105/table/fileupload',
          type: 'post',
          data: data,
          cache: false,
          processData: false,
          contentType: false,
          async: false,
        })
      }
  
      let response = getResponse(data).responseText
      if(response == 'ok') {
        $.ajax({
          url: 'http://10.221.75.105/table/get-table',
          type: 'post',
          beforeSend: (xhr) => { $('#preloader').show() },
          success: (result) => {
              $('#preloader').hide()
              $('tbody tr').remove()
              createTable(result)
              $('.w-modal-file').fadeOut('fast')
            
          }
        })
  
      } else {
        alert('Ошибка загрузки:' + response)
      }
    } else {
      alert('У тебя не получиться ты лох :с')
    }

  })

// close modal from ESCAPE
  $(document).keyup(function(e) {
    if (e.keyCode === 27) {
      $('.w-modal').hide()
      $('.w-modal-file').hide()
    }
  })

  $('.upex').click(() => {
    if(permissions.readWrite)
      $('.w-modal-file').fadeIn('fast')
  })

  $('#m-close').click(() => {
    $('.w-modal').hide()
  })
  $('#mf-close').click(() => {
    $('.w-modal-file').hide()
  })

  //searching
  function tableSearch() {
    var phrase = document.getElementById('n-search');
    var table = document.getElementById('t-body');
    var regPhrase = new RegExp(phrase.value, 'i');
    var flag = false;
    for (var i = 0; i < table.rows.length; i++) {
        flag = false;
        for (var j = table.rows[i].cells.length - 1; j >= 0; j--) {
            flag = regPhrase.test(table.rows[i].cells[j].innerHTML);
            if (flag) break;
        }
        if (flag) {
            table.rows[i].style.display = "";

        } else {
            table.rows[i].style.display = "none";

        }

    }
  }
  $('#n-search').keyup(function() {
    tableSearch()
  })

  $('#selectGroup').on('change', () => {
    tmp = []
    $.ajax({
      url: 'http://10.221.75.105/change-table',
      type: 'post',
      data: {
        tableName: $("#selectGroup option:selected" ).text()
      },
      beforeSend: (xhr) => { $('#preloader').show() },
      success: (result) => {
        $('#preloader').hide()
        arr = []
        delrows = []
        delrowsFront = []
        $('.n-undo').hide()
        $('.n-save').hide()
        $.ajax({
          url: 'http://10.221.75.105/get-table',
          data: {
            tableId : result.id
          },
          beforeSend: (xhr) => { $('#preloader').show() },
          type: 'post',
          success: (result) => {
            if (result == 'No rows') {
              $('.no-rows').show()
              $('.tablewarp').hide()
            } else {
              $('tbody tr').remove()
              createTable(result)
            }
          }
        })
      }
    })
  })

  $('.logout').click(() => {
    $.ajax({
      url: "http://10.221.75.105/table/logout",
      type: "post",
      success: () => {
        window.open('/login', '_self')
      }
    })
  })

  //tree

  let i = 0
  $.ajax({
    url: 'http://10.221.75.105/table/get-services',
    type: 'get',
    beforeSend: (xhr) => { $('#preloader').show() },
    success: (parents) => {
      $('#perloader').hide()
      $.ajax({
        url: 'http://10.221.75.105/table/get-departs',
        type: 'get',
        success: (childes) => {
          createTree(parents, childes, permissions)
          $('.treeview').treeView()
        }
      })
    }
  })

  $('.treeview').on('click', 'li', function() {
    if($(this).attr('type') == 'depart' && $(this).attr('disable') == "false") {
      $.ajax({
        url: 'http://10.221.75.105/table/get-table',
        data : {
          openTable : $(this).attr('class')
        },
        type: 'post',
        beforeSend: (xhr) => { $('#preloader').show() },
        success: (result) => {
          $('#preloader').hide()
          if (result == 'No rows') {
            $('.no-rows').show()
            $('.tablewarp').hide()
          } else {
            $('.treeview li').css('border', '0')
            $(this).css('border-bottom', '1px solid #ecf0f1')
            
            $('.no-rows').hide()
            $('tbody tr').remove()
            createTable(result)
            $('.tablewarp').fadeIn('fast')
          }
        }
      })
    } else {
      console.log('Redjam Permission Controller')
    }
  })

  let treeOpened = 0
  $('#treeopen').click(() => {
    if(treeOpened == 0) {
      $('.pagewarp').css('grid-template-columns', '300px 1fr')
      $('#treeopen').html('<i class="fas fa-chevron-left"></i>')
      treeOpened++
    } else {
      $('.pagewarp').css('grid-template-columns', '0px 1fr')
      $('#treeopen').html('<i class="fas fa-chevron-right"></i>')
      treeOpened--
    }

  })

  $('.treeview li').each(function() {
    console.log($(this).attr('level'))
  })

  $('#adminbtn').click(() => {
    $.ajax({
      url: 'http://10.221.75.105/admin',
      type: 'get',
      success: () => {
        window.open('http://10.221.75.105/admin', '_self')
      }
    })
  })

})