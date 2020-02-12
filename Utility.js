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