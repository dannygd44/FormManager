var test = true;

function email(zone,options) {
  var ctrlSheet = SpreadsheetApp.getActive().getSheetByName("Emails");
  var ctrlRows = getData(ctrlSheet);
  var ctrlRow = ctrlRows[0];
  var emailSS = SpreadsheetApp.openById(ctrlRow["Reporting SS"]);
  var emailSheets = emailSS.getSheets();
  var BCDSS = SpreadsheetApp.openById(ctrlRow["BCD Sheet"]);
  var KISS = SpreadsheetApp.openById(ctrlRow["KI Sheet"]);
  
  //set default options
  if(options == undefined){
    options = {all:true};
  }
  
  //run prefill so the BCD information is up to date
  prefillBCD();
  
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
  var KIrows = getData(KISS.getSheetByName(zone),3);
  var KIareas = [];
  for(var k in KIrows){
    var row = KIrows[k];
    if(row["Area"] != ""){
      KIareas[row["Area"]] = row;
    }
  }
    
    for(var j in rows){
      var row = rows[j];
      var area = row["Area"];
      var KIs = KIareas[area];
      var BCDs = [];
      var dropped = [];
      var baptized = [];
      
      if(area == ""){
        break;
      }
      
      var need = false;
      
      var message = "<body> <h3>Please <b>also</b> report your Key Indicators to your District Leader as usual.</h3>"
      +"<h2>"+area+" Key Indicators and BCD's</h2> <p>Please use the following links to report your Key Indicators and BCD updates." 
      +"<br><b>**In order to open them on your phone, you'll need to long press the link, then select \"Open in Browser\"**</b></p>";
      
      if(options.all || KIs["New People"] === ""){
        message += "<h2> Key Indicators </h2> <p> Please<a href="+row["KI Link"]+"> long press here </a>and click \"Open in Browser\" to report your key indicators. </p>"
        need = true;
      }
      
      //insert a link with a prefilled Form for each person
      message += "<h2>BCD's</h2>"
      if(BCDareas[area] != null){
        
        
        for(var i in BCDareas[area]){
          var BCDrow = BCDareas[area][i];
          
          if(BCDrow["Status"] == "Baptized AND Confirmed"){
            baptized.push(BCDrow);
          }else if(BCDrow["Status"] == "On Date, Not Confirmed"){
            BCDs.push(BCDrow);
          }else if(BCDrow["Status"] == "No Longer on Date"){
            dropped.push(BCDrow);
          }
        }
        
        if(BCDs.length > 0){
          message += "<p>The following people are listed as on date in your area. Please long press the link next to their name and enter any updates you may have.</p>";
          message += "<p>If their name is in orange, double check all information is correct and submit the form.</p>";
          for (var j in BCDs){
            var BCDrow = BCDs[j];
            if(BCDrow["Last Updated"] < new Date(Date.now() - 518400000)){
              message += "<font color = \"orange\">";
              need = true;
            }
            message += "<p>" + BCDrow["Name"] + ": <a href=" + BCDrow["Link"] +">Long press here</a></p></font>";
          }
        }
        
        if(dropped.length > 0){
          message += "<p>The following people are listed as no longer on date.</p>";
          for (var j in dropped){
            var BCDrow = dropped[j];
            message += "<p><font color = \"red\">" + BCDrow["Name"] + ": <a href=" + BCDrow["Link"] +">Long press here</a></p></font>";
          }
        }
        
        if(baptized.length > 0){
          message += "<p>The following people are listed as confirmed this week.</p>";
          for (var j in baptized){
            var BCDrow = baptized[j];
            message += "<p><font color = \"blue\">" + BCDrow["Name"] + ": <a href=" + BCDrow["Link"] +">Long press here</a></p></font>";
          }
        }
        
      }
      
      
      message += "<p> "
      if(BCDareas[row["Area"]] == null){
        message += "If you have anyone on date, report them with ";
      }else{
        message += "For any people not listed above, use";
      }
      message += "<a href = "+row["New BCD Link"]+"> this link.</a>";
      
      
      //If they've submitted everything, check for problems.
      if(!need){
        var errorMessage = "";
        if(KIs["Baptismal Dates"] != BCDs.length){
          errorMessage += "<p>Your KI report indicates you have "+KIs["Baptismal Dates"]+ " people on date, but we have data for "+BCDs.length+". Please double check your numbers.";
          need = true;
        }
        
        if(KIs["Confirmed"] != baptized.length){
          errorMessage += "<p>Your KI report indicates you had "+KIs["Baptismal Dates"]+ " confirmation this week, but we have data for "+baptized.length+". Please double check your numbers.";
          need = true;
        }
        
        message += "<h2> Discrepancies </h2>";
        message += errorMessage;
        message += "<p> You can resubmit your Key Indicators <a href="+row["KI Link"]+">here </a> if needed.</p>";
      }
      
      //finish the email
      message += "<br><br>Thank you! <br> -The Office Assistants </p></body>";
      
      //if they've already done everything, skip generating the email.
      if(need){
        var draft = GmailApp.createDraft(
          row["Email"]
          ,row["Area"] +" KI's and BCD's "+new Date().toLocaleDateString("en-US")
        ,"HTML is not loading properly. Please let the Office Assistants know."
        ,{htmlBody: message
        ,name: "Office Assistants"
         });
        
        //add to the KI Email label.
        draft.getMessage().getThread().addLabel(label);
        
        //right now it's just generating draft emails, put this back in to actually send them.
        //draft.send();
      }
      
    }
  //}
}

function email_jaxE(){
  email("Jax East");
}

function remind_jaxE(){
  email("Jax East",{all : false});
}

function getAll(sheet){
  return sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
}

function getBCDsByArea(ss, zone,options){
  var sheet = ss.getSheetByName(zone);
  if(options == undefined){
    options = {all:true};
  }
  
  var BCDs = getData(sheet,3);
  var areas = [];
  
  for( var i in BCDs){
    var BCD = BCDs[i];
    //if this BCD has been updated in the past 6 days, skip it.
    var testDate = new Date(Date.now() - 518400000);
    if(BCD["Last Updated"] < new Date(Date.now() - 518400000) || options.all){
      if(areas[BCD["Area"]] == null){
        areas[BCD["Area"]] = [BCD];
      }else{
        areas[BCD["Area"]].push(BCD);
      }
    }
  }
  
  return areas;
}


