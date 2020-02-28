function processResponse(form,response) {
  
  //Get the data from the manager sheet
   var id = form.getId();
  var row;
  var manSheet = SpreadsheetApp.getActive().getSheetByName("Submit");
  var manSheetData = manSheet.getRange(1, 1, manSheet.getLastRow(), manSheet.getLastColumn()).getValues();
  var manSheetKey = manSheetData[0];
  for(row = 1;row<manSheetData.length;row++){
    if(manSheetData[row][manSheetKey.indexOf("Form")] == id){
      break;
    }
  }
  
  var SSid = manSheetData[row][manSheetKey.indexOf("Spreadsheet")];
  var ss = SpreadsheetApp.openById(SSid);
  var sId = manSheetData[row][manSheetKey.indexOf("Sheet Identifier")];
  var keyRow = manSheetData[row][manSheetKey.indexOf("Key Row")];
  var matchRaw = manSheetData[row][manSheetKey.indexOf("Match on")];
  var matches = matchRaw.split("+");
  var dateCol = manSheetData[row][manSheetKey.indexOf("Date")];
  var custom = manSheetData[row][manSheetKey.indexOf("Custom")];
  
  
  var itemResponses = response.getItemResponses();
  
  var sName;
  var answers = [];
  
  for(var i in itemResponses){
    var itemR = itemResponses[i];
    var item = itemR.getItem();
    var resp = itemR.getResponse();
    var title = item.getTitle();
    
    if(title == sId){
      sName = resp;
    }else{
      answers[title] = resp;
    }
  }
  
  var sheet = ss.getSheetByName(sName);
  
  var sheetData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var key = sheetData[keyRow-1];
  var sheetRow;
  
  //Make sure the destination sheet contains the column we're matching on.
  for(var m in matches){
    if(key.indexOf(matches[m]) == -1){
      error(form,response,"Destination sheet did not contain a column titled " + matches[m]);
      return;    
    }
  }
  
  //Check if we need to find a match
  var match = matchRaw != "";
  
  //If needed, insert the date
  if(dateCol != ""){
    answers[dateCol] = new Date();
  }
  
  //Find the row to enter data in
  for(var i = keyRow;i < sheetData.length;i++){
    var rowData = sheetData[i]
    if(match){
      //If we need to, look for a match
      for(var j in matches){
        var matchOn = matches[j];
        var formMatch = answers[matches[j]];
        var sheetMatch = rowData[key.indexOf(matches[j])];
        if (answers[matches[j]] == rowData[key.indexOf(matches[j])]){
          if(j == matches.length -1){
            sheetRow = i+1;
          }
        }else{
          break;
        }
      }
      //Otherwise, look for the first empty row.
    }else{
      if(rowData[0] == ""){
        sheetRow = i+1;
      }
    }
    
    if(sheetRow != undefined){
      break;
    }
  }
  
  if(sheetRow == undefined){
    error(form,response,"Unable to match on "+matches);
    return;
  }
  
  if(custom == "NewBCD"){
    //get the BCDID from the top of that column and insterts it into the answers
    var BCDID = sheetData[0][key.indexOf("BCDID")];
    answers["BCDID"] = BCDID;
    
    //Increments the BCDID to set up for the next entry
    //Separates the zone identifier and the number
    var splitBCDID = BCDID.split('.');
    var BCDIDnum = Number(splitBCDID[1]);
    BCDIDnum++;
    sheet.getRange(1, key.indexOf("BCDID")+1).setValue(splitBCDID[0] + '.' + BCDIDnum);
    
    //sets the status
    answers["Status"] = "On date, not confirmed";
  }
  
  //Organize the answers to match the sheet, then input them.
  var rowData = sheetData[sheetRow];
  var output = [];
  
  for(var i in key){
    var out = answers[key[i]];
    if (out != null){
      output[i] = out;
    }
  }
  
  var outRange = sheet.getRange(sheetRow, 1, 1, output.length).setValues([output]);
  
  if(custom == "NewBCD"){
    outRange.setFontColor("red");
  }
  
}

function onSubmit(form){
  //get the responses
  var responses = form.getResponses();
  //pulls the last response to the form.
  var response = responses[responses.length-1];
  processResponse(form,response);
}

function error(form, response, message){
  var ss = SpreadsheetApp.getActive();  
  var sheet = ss.getSheetByName(form.getTitle() + " Errors");
  if(sheet == null){
    sheet = SpreadsheetApp.getActive().insertSheet(form.getTitle() + " Errors");
    var key = ["Form ID","Response ID","Error","Edit Link"];
    sheet.getRange(1,1,1,key.length).setValues([key]);
  }
  
  var row = sheet.getLastRow() + 1;
  var out = [form.getId(),response.getId(),message,response.getEditResponseUrl()];
  sheet.getRange(row, 1, 1, out.length).setValues([out]);
}

function retryErrors(){
  var ss = SpreadsheetApp.getActive(); 
  var sheets = ss.getSheets();
  for(var i in sheets){
    var sheet = sheets[i];
    if(sheet.getName().split(" ").indexOf("Errors") != -1){
      //grab the existing data and then delete the sheet. If the errors persist it will be recreated.
      var data = sheet.getRange(2,1,sheet.getLastRow(),sheet.getLastColumn()).getValues();
      ss.deleteSheet(sheet);
      for(var row in data){
        var rowData = data[row];
        if(rowData[0] == ""){
          break;
        }
        
        var form = FormApp.openById(rowData[0]);
        var response = form.getResponse(rowData[1]);
        processResponse(form,response);
      }
    }
  }
}

function test_onSubmit(){
  var form = FormApp.openById("10uJiRG7uBLo-mh-ygDF3X8Gjx7iaHGNMrWBk8fNlO74");
  onSubmit(form);
}

function test_processResponse(){
  var form = FormApp.openById("1nwGAsOaoZ-Wb4j9yhcUax6JhMjYmNQ61w6CX8ESfGRE");
  var responses = form.getResponses();
  var response = responses[4];
  processResponse(form,response);
}
