// Check if the code is valid
function checkCode(code) {
  const ss = SpreadsheetApp.openById("<>"); // Enter your spreadsheet ID here
  const sheet = ss.getSheetByName("Responses");
  const data = sheet.getDataRange().getValues();
  const inputCode = code.toString().trim();


  Logger.log("Checking code: " + inputCode);


  for (let i = 1; i < data.length; i++) {
    const sheetCode = data[i][7] ? data[i][7].toString().trim() : "";
    let tokenUsed = data[i][9];


    if (typeof tokenUsed === "boolean") tokenUsed = tokenUsed ? "TRUE" : "FALSE";
    else tokenUsed = tokenUsed ? tokenUsed.toString().toUpperCase() : "FALSE";


    Logger.log(`Row ${i + 1}: sheetCode=${sheetCode}, tokenUsed=${tokenUsed}`);


    if (sheetCode === inputCode) {
      if (tokenUsed === "TRUE") {
        return "This code has already been used.";
      } else {
        sheet.getRange(i + 1, 10).setValue("TRUE");    // Column J: Token Used
        sheet.getRange(i + 1, 9).setValue("Verified"); // Column I: Verification Status
        return "verified";
      }
    }
  }


  return "Invalid code. Please check your email and try again.";
}


// API endpoint for GET requests (works cross-origin)
function doGet(e) {
  try {
    const code = e.parameter.code;
    if (!code) throw new Error("No code provided in query parameter");


    const result = checkCode(code);
    return ContentService
           .createTextOutput(JSON.stringify({ status: result }))
           .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in doGet: " + error.toString());
    return ContentService
           .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
           .setMimeType(ContentService.MimeType.JSON);
  }
}
