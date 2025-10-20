const WHATSAPP_LINK = "<>";

function checkCode(code) {
  const ss = SpreadsheetApp.openById("<>");
  const sheet = ss.getSheetByName("Responses");
  const data = sheet.getDataRange().getValues();
  const inputCode = code.toString().trim();

  for (let i = 1; i < data.length; i++) {
    const sheetCode = data[i][7] ? data[i][7].toString().trim() : "";
    let tokenUsed = data[i][9];

    if (typeof tokenUsed === "boolean") tokenUsed = tokenUsed ? "TRUE" : "FALSE";
    else tokenUsed = tokenUsed ? tokenUsed.toString().toUpperCase() : "FALSE";

    if (sheetCode === inputCode) {
      if (tokenUsed === "TRUE") return { status: "used" };
      
      // Mark as used BEFORE returning the link
      sheet.getRange(i + 1, 10).setValue("TRUE");
      sheet.getRange(i + 1, 9).setValue("Verified");
      
      // Create a one-time token
      const token = Utilities.getUuid();
      CacheService.getScriptCache().put(token, WHATSAPP_LINK, 300); // 5 minutes
      
      return { status: "verified", token: token };
    }
  }
  return { status: "invalid" };
}

function getLink(token) {
  const cache = CacheService.getScriptCache();
  const link = cache.get(token);
  
  if (link) {
    // Delete token after use (one-time use)
    cache.remove(token);
    return { status: "success", link: link };
  } else {
    return { status: "expired" };
  }
}

function doGet(e) {
  const callback = e.parameter.callback;
  let result;

  try {
    // Check if this is a verification request or link request
    if (e.parameter.code) {
      const code = e.parameter.code;
      result = checkCode(code);
    } else if (e.parameter.token) {
      const token = e.parameter.token;
      result = getLink(token);
    } else {
      throw new Error("No code or token provided");
    }

  } catch (error) {
    result = { status: "error", message: error.message };
  }

  // Always use JSONP for cross-origin requests
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${JSON.stringify(result)});`)
                         .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
