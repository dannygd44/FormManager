//prefills responses for the form and spreadsheet listed on the given row in the Prefill sheet.
function prefill(row) {
  
  //Get the data from the manager sheet
  var manSheet = SpreadsheetApp.getActive().getSheetByName("Prefill");
  var manSheetData = manSheet.getRange(1, 1, manSheet.getLastRow(), manSheet.getLastColumn()).getValues();
  var manSheetKey = manSheetData[0];
  
  var id = manSheetData[row][manSheetKey.indexOf("Form")];
  var form = FormApp.openById(id);
  var SSid = manSheetData[row][manSheetKey.indexOf("Spreadsheet")];
  var ss = SpreadsheetApp.openById(SSid);
  var sheets = ss.getSheets()
  var sId = manSheetData[row][manSheetKey.indexOf("Sheet Identifier")];
  var keyRow = manSheetData[row][manSheetKey.indexOf("Key Row")];
  //var PrefillRaw = manSheetData[row][manSheetKey.indexOf("Prefill")];
  //var Prefills = PrefillRaw.split("+");
  var destCol = manSheetData[row][manSheetKey.indexOf("Dest Col")];
  
  //loop through the sheets
  //temporarily disabled for testing, only runs for Jax East zone right now.
  //for(var i in sheets){
    var sheet = ss.getSheetByName("Jax East");
    var sheetData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
    var sheetKey = sheetData[keyRow-1];
    var links = [];
    //loop through each row in the sheet
    for(var row = keyRow;row < sheet.getLastRow();row++){
      if(sheetData[row][sheetKey.indexOf("Area")] == ""){
        break;
      }
      var response = prefillForm(form,sheetKey.concat([sId]),sheetData[row].concat([sheet.getName()]));
      var link = response.toPrefilledUrl();
      links.push([link]);
    }
    
    sheet.getRange(keyRow +1, sheetKey.indexOf(destCol)+1, links.length, 1).setValues(links);
  //}
  
}

function prefillForm(form, key, data){
  var response = form.createResponse();
  
  var items = form.getItems();
  
  //loop through the items in the form, inserting data from the matching columns
  for(var i in items){
    var item = items[i];
    var title = item.getTitle();
    
    var col = key.indexOf(title);
    var respRaw = data[col];
    if(col == -1){
      /*if(title == sId){
        respRaw = sheet.getName();
      }else{*/
        continue;
      //}
    }
    
    var type = item.getType();
    
    if(type === FormApp.ItemType.TEXT){
      var text = item.asTextItem();
      var textR = text.createResponse(respRaw);
      response.withItemResponse(textR);  
      
    }else if(type === FormApp.ItemType.MULTIPLE_CHOICE){
      var mc = item.asMultipleChoiceItem();
      try{
        var mcR = mc.createResponse(respRaw);
      }catch(e){
        continue;
      }
      response.withItemResponse(mcR);  
      
    }else if(type === FormApp.ItemType.LIST){
      var list = item.asListItem();
      var listR = list.createResponse(respRaw);
      response.withItemResponse(listR);
      
    }else if(type === FormApp.ItemType.DATE){
      //if the date is blank, move to the next item. Otherwise it defaults to 1/1/1970
      if(respRaw == ""){
        continue;
      }
      var date = item.asDateItem();
      var dateR = date.createResponse(new Date(respRaw));
      response.withItemResponse(dateR);
    }else if(type === FormApp.ItemType.SCALE){
      var scale = item.asScaleItem();
      var scaleStr = respRaw;
      var scaleNum = Number(scaleStr);
      if(isNaN(scaleNum)){
        if(scaleStr === "5+"){
          scaleNum = 5;
        }else{
          console.error("Invalid input for scale number. Input: " +scaleStr);
          scaleNum = 1;
        }
      }
      if(scaleNum > 5){scaleNum = 5}
      var scaleR = scale.createResponse(scaleNum);
      
      response.withItemResponse(scaleR);
    }
  }
  return response;
}

function prefillAll(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Prefill");
  for(var row = 1;row < sheet.getLastRow(); row++){
    prefill(row);
  }
}

function test_prefill(){
  prefill(1);
}
