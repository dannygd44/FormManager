var test = true;

function email(zone) {
  var ctrlSheet = SpreadsheetApp.getActive().getSheetByName("Emails");
  var ctrlRows = getData(ctrlSheet);
  var ctrlRow = ctrlRows[0];
  var emailSS = SpreadsheetApp.openById(ctrlRow["Reporting SS"]);
  var emailSheets = emailSS.getSheets();
  var BCDSS = SpreadsheetApp.openById(ctrlRow["BCD Sheet"]);
  
  //delete existing drafts
  var label = GmailApp.getUserLabelByName("KI Drafts");
  if(label == null){
    label = GmailApp.createLabel("KI Drafts");
  }else{
    var threads = label.getThreads();
    for (var k in threads){
      threads[k].moveToTrash();
    }
  }
  
  //put these back in to generate emails for all zones.
  //for(var i in emailSheets){
  //  var sheet = emailSheets[i];
  var sheet = emailSS.getSheetByName(zone);
    var zone = sheet.getName();
    var rows = getData(sheet);
    
    var BCDareas = getBCDsByArea(BCDSS,zone);
    
    for(var j in rows){
      var row = rows[j];
      
      var message = "<body> <h1>"+row["Area"]+" Key Indicators and BCD's</h1> <p>Please use the following links to report your Key Indicators and BCD updates." 
      +"<br><b>**In order to open them on your phone, you'll need to long press the link, then select \"Open in Browser\"**</b></p>";
      
      message += "<h2> Key Indicators </h2> <p> Please<a href="+row["KI Link"]+"> long press here </a>and click \"Open in Browser\" to report your key indicators. </p>"
      
      //insert a link with a prefilled Form for each person
      message += "<h2>BCDs</h2>"
      if(BCDareas[row["Area"]] != null){
        message += "<p>The following people are listed as on date in your area. Please long press the link next to their name and enter any updates you may have.</p>";
        for (var i in BCDareas[row["Area"]]){
          var BCDrow = BCDareas[row["Area"]][i];
          message += "<p>" + BCDrow["Name"] + ": <a href=" + BCDrow["Link"] +">Long press here</a></p>";
        }
      }
      
      message += "<p> "
      if(BCDareas[row["Area"]] == null){
        message += "If you have anyone on date, report them with ";
      }else{
        message += "For any people not listed above, use";
      }
      message += "<a href = "+row["New BCD Link"]+"> this link.</a> <br><br>Thank you! <br> -The Office Assistants </p></body>";
      
      var draft = GmailApp.createDraft(
        row["Email"]
        ,row["Area"] +" KI's and BCDs "+new Date().toLocaleDateString("en-US")
        ,"HTML is not loading properly. Please let the Office Assistants know"
        ,{htmlBody: message
        ,name: "Office Assistants"
      });
      
      //add to the KI Email label.
      draft.getMessage().getThread().addLabel(label);
      
      //right now it's just generating draft emails, put this back in to actually send them.
      //draft.send();
    }
  //}
}

function email_jaxE(){
  email("Jax East");
}

function getAll(sheet){
  return sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
}

function getBCDsByArea(ss, zone){
  var sheet = ss.getSheetByName(zone);
  
  var BCDs = getData(sheet,3);
  var areas = [];
  
  for( var i in BCDs){
    var BCD = BCDs[i];
    if(areas.indexOf(BCD["Area"]) == -1){
      areas[BCD["Area"]] = [BCD];
    }else{
      areas[BCD["Area"]].push(BCD);
    }
  }
  
  return areas;
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
