var SHEET_NAME = "Waitlist";
var HEADERS = ["Timestamp", "Email", "Source", "Page"];
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var data = readRequest(e);
    var email = String(data.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return respond(e, { ok: false, error: "invalid_email" });
    }
    var sheet = getSheet();
    if (!hasEmail(sheet, email)) {
      sheet.appendRow([
        new Date(),
        email,
        String(data.source || "website"),
        String(data.page || "")
      ]);
    }
    return respond(e, { ok: true });
  } catch (err) {
    return respond(e, { ok: false, error: "server_error" });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function readRequest(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      return (e && e.parameter) || {};
    }
  }
  return (e && e.parameter) || {};
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function hasEmail(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) {
    return false;
  }
  var values = sheet.getRange(2, 2, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === email) {
      return true;
    }
  }
  return false;
}

function respond(e, result) {
  if (e && e.parameter && e.parameter.email) {
    var title = result.ok ? "أنت على القائمة" : "تعذّر التسجيل";
    var text = result.ok
      ? "سنجهّز مقعدك، ونرسل الدعوة عند فتح الأبواب."
      : "تحقق من بريدك الإلكتروني وحاول مرة أخرى.";
    return HtmlService.createHtmlOutput(
      "<!doctype html><html lang=\"ar\" dir=\"rtl\"><meta charset=\"utf-8\">" +
      "<title>" + title + "</title>" +
      "<body style=\"font-family:system-ui,sans-serif;text-align:center;padding:48px\">" +
      "<h1>" + title + "</h1><p>" + text + "</p></body></html>"
    );
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
