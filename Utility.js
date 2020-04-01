//Attempts to open a spreadsheet with the given id. If it fails, returns null.
function safeSSopen(id){
  try{
    return SpreadsheetApp.openById(id);
  }catch(e){
    return null;
  }
}

//Attempts to open a form with the given id. If it fails, returns null.
function safeFormOpen(id){
  try{
    return FormApp.openById(id);
  }catch(e){
    return null;
  }
}

function setupMenus(){
  var ui = SpreadsheetApp.getUi();
  
  //check if there are any error sheets
  var errors = false;
  var sheets = SpreadsheetApp.getActive().getSheets();
  for(var i in sheets){
    if (sheets[i].getName().indexOf("Error") != -1){
      errors = true;
      break;
    }
  }
  
  var menu = ui.createMenu("Form Manager")
  .addSubMenu(ui.createMenu("Setup Tasks")
              .addItem("Set Up Form", "setUpForm")
              .addItem("Reset Menus", "setupMenus")
              .addItem("Prefill All", "prefillAll"))
  .addItem("Prefill BCDs", "prefillBCD")
  .addItem("Email Jax East", "email_jaxE")
  .addItem("Remind Jax East", "remind_jaxE")
  .addItem("Monday Tasks (WIP)","monday");
  
  if(errors){
    menu.addItem("Retry Errors", "retryErrors")
  }
  
  menu.addToUi();
}

function onOpen(){
  setupMenus();
}

function getData(sheet,keyRow){
  if(keyRow == undefined){
    keyRow = 1;
  }
  var key;
  var allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var rows = [];
  
  for(var j in allData){
    var rowData = allData[j];
    if(j<= keyRow-1){
      key = rowData;
      continue;
    }else{
      var row = [];
      for(var k in rowData){
        row[key[k]] = rowData[k];
      }
      rows.push(row);
    }
  }
  
  return rows;
}

function getFile(key){
  var keySheet = SpreadsheetApp.getActive().getSheetByName("Files");
  var data = getData(keySheet);
  
  var keys = [];
  for(var i in data){
    keys[data[i]["Key"]] = data[i]["ID"];
  }
  
  var id = keys[key];
  
  if(id == undefined){
    throw("Unable to find file with key "+key);
  }
  
  var file = DriveApp.getFileById(id);
  var type = file.getMimeType();
  
  if(type == "application/vnd.google-apps.spreadsheet"){
    return SpreadsheetApp.open(file);
  }else if (type == "application/vnd.google-apps.form"){
    return FormApp.openById(id);
  }else if (type == "application/vnd.google-apps.folder"){
    return DriveApp.getFolderById(id);
  }
  
  throw("Unable to find sheet, form or folder with key "+key);
  
}

function test_getFile(){
  var file = getFile("BCD History");
  console.info("Got it!");
}