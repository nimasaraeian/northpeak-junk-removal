/**
 * NorthPeak Junk Removal — lead intake and review request.
 *
 * Two jobs:
 *   1. doPost        — receives a lead from the website and files it as a row.
 *   2. onStatusEdit  — when a row's Status is set to Done, emails that customer
 *                      a review request and records that it was sent.
 *
 * Paste this whole file into Extensions -> Apps Script on the Leads
 * spreadsheet. See SETUP.md for the click-by-click version.
 */

var SHEET_NAME = "Leads";
var REVIEW_LINK = "https://g.page/r/CQpStjbMaZkzEBM/review";

/** Columns, 1-indexed: Date A, Name B, Phone C, Email D, Service E, City F, Source G, Status H, Review Sent I. */
var NAME_COLUMN = 2;
var EMAIL_COLUMN = 4;
var STATUS_COLUMN = 8;
var REVIEW_COLUMN = 9;

/** Row 1 is the header, so real leads start at row 2. */
var FIRST_DATA_ROW = 2;

var REVIEW_SUBJECT = "Thanks from NorthPeak — quick favour?";

/**
 * Receives one lead from the website.
 *
 * Always answers "ok", whatever arrives. A retry or an error page on the site's
 * side would be worse than a dropped row: the lead has already reached the team
 * by Telegram before this is ever called.
 */
function doPost(e) {
  try {
    var lead = parseLead_(e);
    if (!lead) {
      console.error("doPost: request carried no readable JSON lead");
      return ok_();
    }

    var sheet = leadSheet_();
    if (!sheet) {
      console.error('doPost: no sheet named "' + SHEET_NAME + '" in this spreadsheet');
      return ok_();
    }

    sheet.appendRow([
      new Date(),
      lead.name,
      lead.phone,
      lead.email,
      lead.service,
      lead.city,
      lead.source,
      "New",
      ""
    ]);
  } catch (err) {
    console.error("doPost failed: " + err);
  }

  return ok_();
}

/**
 * Installable on-edit trigger.
 *
 * Fires on every edit to the spreadsheet, so it filters hard before doing any
 * work. Handles a multi-row edit too, because dragging "Done" down a column is
 * the obvious thing to do on a busy day.
 *
 * This must be installed as an *installable* trigger, not left as a simple
 * onEdit: sending mail needs authorisation that simple triggers do not carry.
 */
function onStatusEdit(e) {
  try {
    if (!e || !e.range) return;

    var range = e.range;
    var sheet = range.getSheet();
    if (!sheet || sheet.getName() !== SHEET_NAME) return;

    var firstColumn = range.getColumn();
    var lastColumn = firstColumn + range.getNumColumns() - 1;
    if (STATUS_COLUMN < firstColumn || STATUS_COLUMN > lastColumn) return;

    var firstRow = range.getRow();
    var lastRow = firstRow + range.getNumRows() - 1;

    for (var row = firstRow; row <= lastRow; row++) {
      if (row < FIRST_DATA_ROW) continue;
      sendReviewRequestForRow_(sheet, row);
    }
  } catch (err) {
    console.error("onStatusEdit failed: " + err);
  }
}

/** One row's worth of the Done -> review-email rule. Never throws. */
function sendReviewRequestForRow_(sheet, row) {
  try {
    var status = text_(sheet.getRange(row, STATUS_COLUMN).getValue()).trim().toLowerCase();
    if (status !== "done") return;

    var reviewCell = sheet.getRange(row, REVIEW_COLUMN);
    // Already handled. This is what stops a second edit from sending again.
    if (text_(reviewCell.getValue()).trim().toLowerCase() === "yes") return;

    var email = text_(sheet.getRange(row, EMAIL_COLUMN).getValue()).trim();
    if (!email) {
      reviewCell.setValue("No email");
      return;
    }

    var name = text_(sheet.getRange(row, NAME_COLUMN).getValue()).trim();
    MailApp.sendEmail(email, REVIEW_SUBJECT, reviewBody_(name));
    reviewCell.setValue("Yes");
  } catch (err) {
    console.error("row " + row + " review request failed: " + err);
  }
}

function reviewBody_(name) {
  return [
    // "there" keeps the greeting readable if the row has no name.
    "Hi " + (name || "there") + ",",
    "",
    "Thanks for choosing NorthPeak Junk Removal today! If you were happy with the job, a quick Google review would mean the world to our small local crew:",
    "",
    REVIEW_LINK,
    "",
    "Thanks again!",
    "— Nima & the NorthPeak team"
  ].join("\n");
}

function parseLead_(e) {
  if (!e || !e.postData || !e.postData.contents) return null;

  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return null;
  }

  if (!data || typeof data !== "object") return null;

  return {
    name: text_(data.name),
    phone: text_(data.phone),
    email: text_(data.email),
    service: text_(data.service),
    city: text_(data.city),
    source: text_(data.source)
  };
}

function leadSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) return null;
  return spreadsheet.getSheetByName(SHEET_NAME);
}

function text_(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function ok_() {
  return ContentService.createTextOutput("ok");
}
