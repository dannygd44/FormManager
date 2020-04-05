function monday() {
  //check for problems
  //if problems, send report to OAs
  
  //if not, continue.
  
  //make a copy of the BCD and KI sheets, put them in their respective history folders
  var BCDfile = DriveApp.getFileById(getFile("BCD Sheet").getId());
  var BCDhistoryFolder = getFile("BCD History");
  BCDfile.makeCopy(BCDfile.getName(),BCDhistoryFolder);
  
  var KIfile = DriveApp.getFileById(getFile("KI Sheet").getId());
  var KIhistoryFolder = getFile("KI History");
  KIfile.makeCopy(KIfile.getName(),KIhistoryFolder);
  
  //move baptisms to YTD, remove dropped
  pruneBCDs(SpreadsheetApp.open(BCDfile));
  
  //generate reports for the Stake Presidents
  
  //make a copy of the BCD sheet for reports
  var BCDreport = BCDfile.makeCopy(BCDfile.getName()+" Formatted");
  
  //go through the sheets and format them
  var exclude = ["Summary","Old","Key"];
  var BCDkrepSheets = SpreadsheetApp.open(BCDreport).getSheets();
  
  for(var i in BCDkrepSheets){
    var sheet = BCDkrepSheets[i];
    var name = sheet.getName();
    if(exclude.indexOf(sheet.getName()) == -1){
      prepBCDreport(sheet);
    }
  }
  
}

function pruneBCDs(ss){
  var BCDsheets = ss.getSheets();
  var topOffset = 3;
  for(var i in BCDsheets){
    var sheet = BCDsheets[i];
    var data = getData(sheet, topOffset);
    
    var BCDsOut = [];
    var BapsOut = [];
    
    var j;
    var row;
    for(j in data){
      row = data[j]
      
      //this checks where the 
      if(row["Area Code"] == "Area Code"){
        break;
      }else if(row["Area"] == ""){
        continue;
      }
      
      if(row["Status"] == Status.ONDATE || row["Status"] == ""){
        BCDsOut.push(row);
      }else if(row["Status"] == Status.CONFIRMED){
        BapsOut.push(row);
      }
      
    }
    
    //find the key for the YTD section
    var YTDkey = [];
    for(var k in row){
      var val = row[k];
      if (val != ""){
        YTDkey[k] = val;
      }
    }
    
  }
}

function test_pruneBCDs(){
  var ss = getFile("BCD Sheet");
  pruneBCDs(ss);
}

function prepBCDreport(sheet){
  var keyRow = 2;
  
  var range = sheet.getDataRange();
  range.setFontColor("black");
  var data = range.getValues();
  
  //find the key and format it correctly
  var keyCol = data[keyRow].indexOf("Key");
  for(var row = keyRow;row<data.length;row++){
    if(data[row][keyCol] == "New Updates in Orange"){
      break;
    }
  }
  
  //format the key
  var keyRange = sheet.getRange(keyRow+1, keyCol+1, row-keyRow, 3);
  keyRange.breakApart();
  keyRange.clearFormat();
  keyRange = sheet.getRange(keyRow+1, keyCol+1, row-keyRow, 2);
  keyRange.mergeAcross();
  keyRange.setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  //clear out the rows beneath the key we're keeping
  sheet.getRange(row+1, keyCol+1, 10, 3).clear();
  
  //hide any blank rows beyond that point
  for(row;row<data.length;row++){
    if(data[row][2] == ""){
      break;
    }
  }
  var startRow = row;
  
  var endRow;
  //find the row where the YTD section starts
  for(row;row<data.length;row++){
    if(data[row][1] != ""){
      endRow = row-2;
      break;
    }
  }
  
  //hide the rows in between
  sheet.hideRows(startRow+1, endRow-startRow);
  sheet.hideRows(2);
  
}

function test_prepBCDreport(){
  var ss = SpreadsheetApp.openById("1WGQ89oVombf5AFddqX_BSyWKk_x6QqrSFhKTAR44YVU");
  var sheet = ss.getSheetByName("Jax East");
  prepBCDreport(sheet);
}
