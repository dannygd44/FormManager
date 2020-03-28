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
  .addItem("Remind Jax East", "remind_jaxE");
  
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