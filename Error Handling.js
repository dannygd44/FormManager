function error(form, response, message){
  var ss = SpreadsheetApp.getActive();  
  var sheet = ss.getSheetByName(form.getTitle() + " Errors");
  
  //Get the titles and responses for all the questions
  var titles = [];
  var answers = [];
  var items = response.getItemResponses();
  for(var i in items){
    titles.push(items[i].getItem().getTitle());
    answers.push(items[i].getResponse());
  }
  
  if(sheet == null){
    sheet = SpreadsheetApp.getActive().insertSheet(form.getTitle() + " Errors");
    var key = ["Form ID","Response ID","Error","Edit Link","View Link"].concat(titles);
    sheet.getRange(1,1,1,key.length).setValues([key]);
    SpreadsheetApp.flush();
  }
  
  var row = sheet.getLastRow() + 1;
  var out = [form.getId(),response.getId(),message,response.getEditResponseUrl(),response.toPrefilledUrl()].concat(answers);
  
  
  
  
  sheet.getRange(row, 1, 1, out.length).setValues([out]);
}

function retryErrors(){
  var ss = SpreadsheetApp.getActive(); 
  var sheets = ss.getSheets();
  for(var i in sheets){
    var sheet = sheets[i];
    if(sheet.getName().split(" ").indexOf("Errors") != -1){
      //grab the existing data and then delete the sheet. If the errors persist it will be recreated.
      var data = sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn()).getValues();
      var key;
      ss.deleteSheet(sheet);
      for(var row in data){
        var rowData = data[row];
        if(rowData[0] == ""){
          break;
        }else if(rowData[0] == "Form ID"){
          key = rowData;
          continue;
        }
        
        var form = FormApp.openById(rowData[0]);
        var response = form.getResponse(rowData[1]);
        
        //check if any of the data has been changed in the spreadsheet
        var items = response.getItemResponses();
        var titles = [];
        var answers = [];
        var changed = false;
        for(var i in items){
          titles.push(items[i].getItem().getTitle());
          answers.push(items[i].getResponse());
        }
        
        for(var j in key){
          if(titles.indexOf(key[j]) != -1){
            if(rowData[j] != answers[titles.indexOf(key[j])]){
              changed = true;
              break;
            }
          } 
        }
        if(changed){
          var newResponse = prefillForm(form,key,rowData);
          form.deleteResponse(rowData[1]);
          response = newResponse.submit();
        }else{
          processResponse(form,response);
        }
      }
    }
  }
  setupMenus();
}