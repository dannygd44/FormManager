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
  .addItem("Prefill All", "prefillAll")
  .addItem("Reset Menus", "setupMenus")
  .addItem("Jax East Emails", "email_jaxE");
  
  if(errors){
    menu.addItem("Retry Errors", "retryErrors")
  }
  
  menu.addToUi();
}