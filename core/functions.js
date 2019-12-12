const etj = require('convert-excel-to-json')
const db = require('../config/db')

module.exports = {
  formatDate(date) {

    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
  
    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
  
    var yy = date.getFullYear() % 100;
    if (yy < 10) yy = '0' + yy;
    
    (date.getHours() < 10) ? hours = '0' + date.getHours() : hours = date.getHours();
    (date.getMinutes() < 10) ? minutes = '0' + date.getMinutes() : minutes = date.getMinutes();

    return dd + '.' + mm + '.' + yy + '_' + hours + '/' + minutes;
  },
  excelToDB(file) {
    const result = etj({
      sourceFile: file,
    });

    var data = result['Лист1']
    
    var sheets = []
    
    var keyCount = 0;
    for(let key in data[0]) {
      keyCount++
    }
    
    for (let i = 1; i < data.length; i++) {
      var arr = []
      for(var key in data[i]) {
        arr.push(data[i][key])
      }
      sheets.push(arr)
    }
    return sheets 
  },
  getSmallTableName(tableNum) {
    let con = db.createConnection()
    return con.query('select OtdelSmallName from otdeli where id = ?', [tableNum], (err, result) => {
      return result[0].OtdelSmallName
    })
  }
}