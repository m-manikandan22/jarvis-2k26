/**
 * JARVIS 2K26 Database Setup
 * This script initializes the relational database structure in the bound spreadsheet.
 * Run setupDB() manually once from the Apps Script editor.
 */

const SCHEMA = {
  'Teams': ['TeamID', 'TeamName', 'CreatedAt', 'CaptainMemberID'],
  'Members': ['MemberID', 'TeamID', 'FullName', 'CollegeName', 'Department', 'YearOfStudy', 'Email', 'Phone'],
  'RegistrationEvents': ['RegEventID', 'TeamID', 'MemberID', 'EventID', 'Session', 'Timestamp'],
  'Payments': ['PaymentID', 'TeamID', 'TotalAmount', 'UTR_Reference', 'ScreenshotURL', 'Status', 'PaidAt', 'VerifiedAt'],
  'Config': ['ConfigKey', 'ConfigValue']
};

const DEFAULT_CONFIG = {
  'UPI_ID': 'your-upi-id@bank',
  'BASE_TEAM_FEE': '100',
  'EVENT_PRICES_JSON': JSON.stringify({
    'technova': 50,
    'coderelay': 50,
    'funfiesta': 30,
    'listenlink': 30,
    'bytebattles': 50,
    'cyberarena': 50,
    'hackonomics': 50,
    'aiwhisperer': 50,
    'corporatequest': 50,
    'chaosroom': 50
  })
};

/**
 * Main entry point for database initialization.
 */
function setupDB() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error('This script must be bound to a Google Spreadsheet.');
    }

    const ssId = ss.getId();
    PropertiesService.getScriptProperties().setProperty('DATABASE_SPREADSHEET_ID', ssId);

    // Create/Verify all sheets
    for (const sheetName in SCHEMA) {
      verifySheet_(ss, sheetName, SCHEMA[sheetName]);
    }

    // Initialize Config defaults
    initializeConfig_(ss);

    // Trigger authorization scopes
    MailApp.getRemainingDailyQuota();
    DriveApp.getRootFolder();


    const log = [
      '====================================',
      'JARVIS 2K26 RELATIONAL SETUP',
      '====================================',
      `Database ID: ${ssId}`,
      'Sheets initialized: Teams, Members, RegistrationEvents, Payments, Config',
      'Config defaults applied',
      'Authorization scope verified',
      '',
      'DATABASE SETUP COMPLETE',
      '===================================='
    ].join('\\n');

    Logger.log(log);
    return { status: 'success', message: 'Relational database initialized successfully.' };
  } catch (e) {
    Logger.log('Setup failed: ' + e.message);
    throw e;
  }
}

function verifySheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const isSchemaCorrect = currentHeaders.every((h, i) => h === headers[i]);

  if (!isSchemaCorrect) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // Basic formatting
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);
  if (!sheet.getFilter()) {
    headerRange.createFilter();
  }
}

function initializeConfig_(ss) {
  const sheet = ss.getSheetByName('Config');
  const data = sheet.getDataRange().getValues();
  const existingKeys = data.map(row => row[0]);

  for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
    if (!existingKeys.includes(key)) {
      sheet.appendRow([key, value]);
    }
  }
}
