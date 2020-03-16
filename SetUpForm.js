function setUpForm() {
  
  //Get the form, either by getting the ID for an existing form, or generating a new form.
  var form;
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert("Would you like to create a new form?",
                          "To use an existing form, click no.",
                          ui.ButtonSet.YES_NO);
  var button = response;
  if(button == ui.Button.YES){
    response = ui.prompt("What should the new form be named?",
                             ui.ButtonSet.OK);
    form = FormApp.create(response.getResponseText());
  }else{
    response = ui.prompt("What is the ID of the existing form?",
                             "It's a bunch of random looking text between two slashes in the URL.",
                             ui.ButtonSet.OK)
    form = safeFormOpen(response.getResponseText());
    while(form == null){
      response = ui.prompt("Please Re-enter ID",
                           "We were unable to open a form with that ID. Please double check and try again.",
                           ui.ButtonSet.OK)
      form = safeFormOpen(response.getResponseText());
    }
  }
  
  //Get the spreadsheet it's going to enter data into
  var ss;
  response = ui.alert("Would you like to create a new spreadsheet?",
                          "To use an existing sheet, click no.",
                          ui.ButtonSet.YES_NO);
  var button = response;
  if(button == ui.Button.YES){
    response = ui.prompt("What should the new spreadsheet be named?",
                             ui.ButtonSet.OK);
    ss = SpreadsheetApp.create(response.getResponseText());
  }else{
    response = ui.prompt("What is the ID of the existing spreadsheet?",
                             "It's a bunch of random looking text between two slashes in the URL.",
                             ui.ButtonSet.OK);
    ss = safeSSopen(response.getResponseText());
    while(ss == null){
      response = ui.prompt("Please Re-enter ID",
                           "We were unable to open a spreadsheet with that ID. Please double check and try again.",
                           ui.ButtonSet.OK)
      ss = safeSSopen(response.getResponseText());
    }
  }
  
  //set up a trigger so when this form is submitted it's processed by this script
  buildTrigger(form);
  
  //enter the form and ss ids into a new row
  var manSheet = SpreadsheetApp.getActiveSheet();
  var idsRange = manSheet.getRange(manSheet.getLastRow()+1, 1, 1, 2);
  idsRange.setValues([[form.getId(),ss.getId()]]);
  idsRange.setNotes([[form.getTitle(),ss.getName()]]);
  
  //let the user know what else needs to happen 
  //TODO add verification here. It should work as long as everything matches up, but I don't want to count on the user always entering it correctly
  ui.alert("Linking complete.","Please add data to the remaining columns before beginning submissions.",ui.ButtonSet.OK);
  
}



function buildTrigger(form){
  ScriptApp.newTrigger("onSubmit")
  .forForm(form)
  .onFormSubmit()
  .create()
}

function test_buildTrigger(){
  var form = FormApp.openById("1nwGAsOaoZ-Wb4j9yhcUax6JhMjYmNQ61w6CX8ESfGRE");
  buildTrigger(form);
}
