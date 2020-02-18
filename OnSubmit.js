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
    console.error("Unable to match on "+matches);
    throw("Unable to locate row that matches given data.");
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
  
  sheet.getRange(sheetRow, 1, 1, output.length).setValues([output]);
  
}

function onSubmit(form){
  //get the responses
  var responses = form.getResponses();
  //pulls the last response to the form.
  var response = responses[responses.length-1];
  processResponse(form,response);
}

function test_onSubmit(){
  var form = FormApp.openById("1nwGAsOaoZ-Wb4j9yhcUax6JhMjYmNQ61w6CX8ESfGRE");
  onSubmit(form);
}
