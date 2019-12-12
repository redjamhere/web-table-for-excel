function createTable (result) {
          // insert rows in table
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
            `<tr>
              <th scope="row">${result[i].id}</th>
              ${str}
            </tr>`
            $("#t-tbl").append(newRow)
          }
}

function getTable() {
  $.ajax({
    url: 'http://10.221.75.105:5000/get-table',
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
  // get data for table
  $.ajax({
    url: 'http://10.221.75.105:5000/get-table',
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

  $.ajax({
    url: 'http://10.221.75.105:5000/table-list',
    type: 'get',
    success: (result) => {
      for(let i = 0; i< result.length; i++) {
        $('#selectGroup').append(`<option value="${i}">${result[i].OtdelFullName}</option>`)
      }
    }
  })

  $.ajax({
    url: 'http://10.221.75.105:5000/get-cookie',
    type: 'post',
    success: (result) => {
      if (result.userdata.readwrite == '0') {
        $('.n-add').text("Только чтение")
        $('.n-add').attr('disabled', true)
        $('.upex').attr('disabled', true)
        $('.n-add').css('background-color', 'red')
      }
    }
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
    $.ajax({
      url: 'http://10.221.75.105:5000/get-cookie',
      type: 'post',
      success: (result) => {
        if(result.userdata.readwrite == '1') {
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
        }
      }
    })
  })

  $('.n-save').click(() => {
    if (window.confirm("Сохранить изменения?")) { 
      arr = getUnique(arr)
      tmp = []
      for (let i = 0; i < arr.length; i++) {
        tmp.push(JSON.parse(arr[i]))
      }
        
      $.ajax({
        url: 'http://10.221.75.105:5000/change-data',
        type: 'post',
        data: {
          datas: tmp,
        },
        success: (result) => {
          arr = []
          $('.n-save').hide()
          $('.n-undo').hide()
          alert('Изменения успешно сохранены')
        }
      })
    }
  })

  $('.n-undo').click(() => {
      arr = getUnique(arr)
      tmp = []
      for (let i = 0; i < arr.length; i++) {
        tmp.push(JSON.parse(arr[i]))
      }
      console.log(tmp)
      var indent = tmp.length - 1
      console.log(tmp[indent].oldText)
      $(`#${tmp[indent].span}`).text(`${tmp[indent].oldText}`)
      arr.pop()
      if (arr.length == 0) {
        $('.n-undo').hide()
        $('.n-save').hide()
      }

  })  
  
  $('.n-add').click(() => {
    $.ajax({
      url: 'http://10.221.75.105:5000/add-data',
      type: 'post',
      success: (result) => {
        $('tbody > tr').remove()
      }
    })
    $.ajax({
      url: 'http://localhost:5000/get-table',
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
  })
// requset upladExcel

  var files
  $('#upfile').change(function() {
    files = this.files
  })

  $('#upfile-btn').click(function(event) {
    event.stopPropagation()    
    event.preventDefault()

    var data = new FormData()
    $.each(files, function(key, value) {
      data.append(key, value)
    })

    function getResponse(data) {
      return  $.ajax({
        url: 'http://10.221.75.105:5000/fileupload',
        type: 'post',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        async: false,
      })
    }

    var status = getResponse(data).responseText
    if(status == 'ok') {
      $.ajax({
        url: 'http://10.221.75.105:5000/get-table',
        type: 'post',
        success: (result) => {
            $('tbody tr').remove()
            createTable(result)
            $('.w-modal-file').fadeOut('fast')
          
        }
      })

    } else {
      alert('Ошибка загрузки:' + status)
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
      url: 'http://10.221.75.105:5000/change-table',
      type: 'post',
      data: {
        tableName: $("#selectGroup option:selected" ).text()
      },
      success: (result) => {
        $.ajax({
          url: 'http://10.221.75.105:5000/get-table',
          data: {
            tableId : result
          },
          type: 'post',
          success: (result) => {
            if (result == 'No rows') {
              $('.no-rows').show()
              $('.tablewarp').hide()
            } else {
              $('tbody tr').remove()
              createTable(result)
              $('#welcom-span').text(`Таблица: ${$("#selectGroup option:selected" ).text()}`)
            }
          }
        })
      }
    })
  })

  $('.logout').click(() => {
    $.ajax({
      url: "http://10.221.75.105:5000/logout",
      type: "post",
      success: () => {
        window.open('/', '_self')
      }
    })
  })

})





