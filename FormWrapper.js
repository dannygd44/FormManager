function FormWrapper(form){
  try{
    form.isQuiz()
  }catch(e){
    throw("Invalid form in FormWrapper().");
  }
  this.form = form;
  this.id = form.getId();
  
  this.getSS = function(){
    
    var id = form.getId();
    var properties = PropertiesService.getScriptProperties();
    var ssid = properties.getProperty(id + ":ss");
    var ss = safeSSopen(ssid);
    if(ss == null){
      var ui = SpreadsheetApp.getUi();
      var response = ui.prompt("What spreadsheet should this form insert data into?",
                               "Please insert just the id for that spreadsheet.",
                               ui.ButtonSet.OK_CANCEL);
      var button = response.getSelectedButton();
      if(button != ui.Button.OK){
        throw("getSS operation cancelled by user.");
      }
      ssid = response.getResponseText();
      ss = safeSSopen(ssid);
      while(ss == null){
        response = ui.prompt("Unable to Find Spreadsheet",
                             "The id is the long set of random characters in the sheet's URL.",
                             ui.ButtonSet.OK_CANCEL);
        button = response.getSelectedButton();
        if(button != ui.Button.OK){
          throw("getSS operation cancelled by user.");
        }
        ssid = response.getResponseText();
        ss = safeSSopen(ssid);
      }
      properties.setProperty(id + ":ss", ssid);
    }
    return ss;
  }
  
  this.setSS = function(form,ss){
    var id = form.getId();
    ss = safeSSopen(ssid);
    if(ss != null){
      properties.setProperty(id + ":ss", ssid);
    }else{
      throw("Invalid ss sent to setSS")
    }
  }
  
  //Attempts to open a spreadsheet with the given id. If it fails, returns null.
  this.safeSSopen = function(id){
    try{
      return SpreadsheetApp.openById(id);
    }catch(e){
      return null;
    }
  }
  
  
  
  
  return this;
}

function test_getSS(){
  var form = FormApp.openById("1LSDmBtY-2OfOhyYfkPFjDtBunpuqGyxBB8eIrciz-zo")
  var wrapper = FormWrapper(form)
  console.info(wrapper.getSS().getId());
}