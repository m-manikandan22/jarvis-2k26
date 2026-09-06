/**
 * JARVIS 2K26 Relational Backend
 * Handles atomic team registration, member-level slot validation, and payment tracking.
 */

const TIMEZONE = 'Asia/Kolkata';

const EVENT_SCHEDULE = {
  'technova': { title: 'Paper Symposium', session: 'FULL_DAY', venue: 'Auditorium' },
  'coderelay': { title: 'Relay Coding', session: 'MORNING', venue: 'NH1' },
  'funfiesta': { title: 'Carnival Games', session: 'MORNING', venue: 'NH2' },
  'listenlink': { title: 'Guess the Hacker', session: 'MORNING', venue: 'NH3' },
  'bytebattles': { title: 'Tech Debate', session: 'MORNING', venue: 'NH4' },
  'cyberarena': { title: 'E-Sports', session: 'FULL_DAY', venue: 'NH5' },
  'hackonomics': { title: 'Mystery Box', session: 'EVENING', venue: 'NH1' },
  'aiwhisperer': { title: 'Prompt Engineering Battle', session: 'EVENING', venue: 'NH2' },
  'corporatequest': { title: 'HR Interview', session: 'EVENING', venue: 'NH3' },
  'chaosroom': { title: 'Chaos Room', session: 'EVENING', venue: 'NH4' },
};

// --- Database Helpers ---

function getDatabaseSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const ssId = props.getProperty('DATABASE_SPREADSHEET_ID');
  if (!ssId) throw new Error('DATABASE_SPREADSHEET_ID is not configured in Script Properties.');

  const ss = SpreadsheetApp.openById(ssId);
  if (!ss) throw new Error('Failed to open spreadsheet with provided ID.');

  return ss; // Explicitly returns Spreadsheet object
}

function getSheet_(name) {
  return getDatabaseSpreadsheet_().getSheetByName(name);
}

function generateId_(prefix) {
  const stamp = Utilities.formatDate(new Date(), TIMEZONE, 'yyMMdd-HHmmss');
  const rand = Math.floor(100 + Math.random() * 899);
  return `${prefix}-${stamp}-${rand}`;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// --- Validation Logic ---

function validateRegistration_(body) {
  const errors = {};
  if (!body.teamName) errors.teamName = 'Team name is required';
  if (!body.captain || !body.captain.email || !body.captain.fullName) {
    errors.captain = 'Captain details are required';
  }

  // Validate members (including captain)
  const allMembers = [body.captain, ... (body.members || [])];
  const seenIdentity = new Set();

  allMembers.forEach((m, idx) => {
    const idStr = `${m.email}|${m.phone}`;
    if (seenIdentity.has(idStr)) {
      errors[`member_${idx}`] = 'Duplicate member in same team';
    }
    seenIdentity.add(idStr);
  });

  // Validate Events
  if (!Array.isArray(body.events) || body.events.length === 0) {
    errors.events = 'Select at least one event';
  } else {
    const fullDayCount = body.events.filter(e => e.session === 'FULL_DAY').length;
    const morningCount = body.events.filter(e => e.session === 'MORNING').length;
    const eveningCount = body.events.filter(e => e.session === 'EVENING').length;

    if (fullDayCount > 1) errors.general = 'You can select only one Full Day event.';
    else if (morningCount > 1) errors.general = 'You can select only one Morning event.';
    else if (eveningCount > 1) errors.general = 'You can select only one Evening event.';

    for (const sel of body.events) {
      const sched = EVENT_SCHEDULE[sel.id];
      if (!sched || sched.session !== sel.session) {
        errors.general = `Event ${sel.id} is not available in ${sel.session} session`;
        return errors;
      }
    }
  }

  return errors;
}

// --- Email Notification System ---

function sendConfirmationEmail_(body, teamId) {
  const members = [body.captain, ...(body.members || [])];
  const emails = members
    .map(m => String(m.email || '').trim().toLowerCase())
    .filter(e => e && e.includes('@'));

  const uniqueEmails = [...new Set(emails)];
  console.log('JARVIS EMAIL RECIPIENTS:', JSON.stringify(uniqueEmails));
  console.log('JARVIS EMAIL RECIPIENT COUNT:', uniqueEmails.length);

  if (uniqueEmails.length === 0) return;

  const teamName = body.teamName;
  const college = body.captain.collegeName;
  const dept = body.captain.department;

  const eventListHtml = body.events.map(sel => {
    const sched = EVENT_SCHEDULE[sel.id];
    return `
      <tr>
        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #333;">${sched.title}</td>
        <td style="padding: 12px; border: 1px solid #ddd; color: #666;">${sel.session.replace('_', ' ')}</td>
        <td style="padding: 12px; border: 1px solid #ddd; color: #666;">${sched.venue}</td>
      </tr>`;
  }).join('');

  const membersListHtml = members.map(m => `<li>${m.fullName}</li>`).join('');

  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; color: #333;">
      <div style="background-color: #1a1a1a; color: #ffffff; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">JARVIS 2K26</h1>
        <p style="margin: 5px 0 0; font-size: 16px; opacity: 0.8;">Registration Confirmed</p>
      </div>
      <div style="padding: 30px; line-height: 1.6;">
        <p>Hello,</p>
        <p>Your team registration for <strong>JARVIS 2K26</strong> has been successfully confirmed.</p>

        <div style="background-color: #f9f9f9; border-left: 4px solid #1a1a1a; padding: 20px; margin: 25px 0; text-align: center;">
          <span style="display: block; font-size: 14px; color: #666; margin-bottom: 5px;">Registration ID</span>
          <strong style="font-size: 22px; color: #1a1a1a; font-family: monospace;">${teamId}</strong>
        </div>

        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; color: #1a1a1a;">Team Details</h3>
        <p style="margin: 5px 0;"><strong>College:</strong> ${college}</p>
        <p style="margin: 5px 0;"><strong>Department:</strong> ${dept}</p>

        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 25px; color: #1a1a1a;">Registered Events</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
          <thead>
            <tr style="background-color: #f2f2f2; text-align: left;">
              <th style="padding: 12px; border: 1px solid #ddd;">Event</th>
              <th style="padding: 12px; border: 1px solid #ddd;">Session</th>
              <th style="padding: 12px; border: 1px solid #ddd;">Venue</th>
            </tr>
          </thead>
          <tbody>
            ${eventListHtml}
          </tbody>
        </table>

        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 25px; color: #1a1a1a;">Team Members</h3>
        <ul style="padding-left: 20px; margin: 10px 0;">
          ${membersListHtml}
        </ul>

        <div style="margin-top: 30px; padding: 20px; background-color: #fffbe6; border: 1px solid #ffe58f; border-radius: 4px; font-size: 14px;">
          <strong>Important:</strong> Please keep your Registration ID safely. You may need it during check-in.
        </div>
      </div>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 13px; color: #888;">
        <p style="margin: 0;"><strong>JARVIS 2K26 Team</strong><br>PMCTECH</p>
      </div>
    </div>
  `;

  const textFallback = `
JARVIS 2K26 - Registration Confirmed
Registration ID: ${teamId}

Hello,

Your team registration for JARVIS 2K26 has been successfully confirmed.

Team Details:
- College: ${college}
- Department: ${dept}

Registered Events:
${body.events.map(sel => {
  const sched = EVENT_SCHEDULE[sel.id];
  return `- ${sched.title} (${sel.session}, ${sched.venue})`;
}).join('\n')}

Team Members:
${members.map(m => `- ${m.fullName}`).join('\n')}

Important: Please keep your Registration ID safely. You may need it during check-in.

JARVIS 2K26 Team, PMCTECH
  `.trim();

  uniqueEmails.forEach(email => {
    try {
      console.log('JARVIS SENDING EMAIL TO:', email);
      GmailApp.sendEmail(email, `JARVIS 2K26 — Registration Confirmed — ${teamId}`, textFallback, {
        htmlBody: htmlTemplate
      });
      console.log('JARVIS EMAIL SENT TO:', email);
    } catch (emailErr) {
      console.error('JARVIS EMAIL ERROR:', String(emailErr));
      throw emailErr;
    }
  });
}

// --- Pricing Logic ---

function calculateTotalAmount_(ss, eventIds) {
  const configSheet = ss.getSheetByName('Config');
  const data = configSheet.getDataRange().getValues();
  const config = {};
  data.forEach(row => config[row[0]] = row[1]);

  const baseFee = parseFloat(config['BASE_TEAM_FEE'] || 0);
  const prices = JSON.parse(config['EVENT_PRICES_JSON'] || '{}');

  let eventTotal = 0;
  eventIds.forEach(id => {
    eventTotal += (prices[id] || 0);
  });

  return baseFee + eventTotal;
}

// --- Main API ---

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const requestType = body.requestType || 'registration';

    if (requestType === 'registration') {
      return handleRegistration(body);
    } else if (requestType === 'paymentUpdate') {
      return handlePaymentUpdate(body);
    } else if (requestType === 'calculatePayment') {
      return handleCalculatePayment(body);
    }

    return jsonOut_({ status: 'error', errors: { general: 'Invalid request type' } });
  } catch (err) {
    return jsonOut_({ status: 'error', errors: { general: 'Server error: ' + err.message } });
  }
}

function handleCalculatePayment(body) { // FIXED
  if (!body.events || !Array.isArray(body.events)) {
    return jsonOut_({
      status: 'error',
      errors: { general: 'No events provided for payment calculation' }
    });
  }

  const ss = getDatabaseSpreadsheet_();
  const totalAmount = calculateTotalAmount_(ss, body.events.map(e => e.id));
  const paymentId = generateId_('P');

  return jsonOut_({
    status: 'success',
    totalAmount: totalAmount,
    paymentId: paymentId
  });
}

function handleRegistration(body) {
  const errors = validateRegistration_(body);
  if (Object.keys(errors).length > 0) return jsonOut_({ status: 'error', errors });

  // Timing and Spreadsheet Setup
  const t_start = Date.now();
  const ss = getDatabaseSpreadsheet_();

  // TEMPORARY DIAGNOSTICS
  Logger.log('DATABASE OBJECT TYPE: ' + Object.prototype.toString.call(ss));
  Logger.log('HAS getSheetByName: ' + (typeof ss.getSheetByName));
  if (ss && typeof ss.getName === 'function') {
    Logger.log('DATABASE NAME: ' + ss.getName());
  }

  console.log('TIMING openSpreadsheet=' + (Date.now() - t_start) + 'ms');

  const t_config = Date.now();
  const totalAmount = calculateTotalAmount_(ss, body.events.map(e => e.id));
  console.log('TIMING config=' + (Date.now() - t_config) + 'ms');

  const memberSheet = ss.getSheetByName('Members');
  const teamSheet = ss.getSheetByName('Teams');
  const regEventsSheet = ss.getSheetByName('RegistrationEvents');
  const paymentSheet = ss.getSheetByName('Payments');

  // 1. Generate IDs and Prepare Data
  const teamId = generateId_('T');
  const teamName = body.teamName;
  const createdAt = new Date();
  const timestamp = new Date();

  const captainId = generateId_('M');
  const memberIds = (body.members || []).map(() => generateId_('M'));
  const allMemberIds = [captainId, ...memberIds];

  // Build Members Batch (Captain + Members)
  const memberRows = [];
  memberRows.push([
    captainId, teamId, body.captain.fullName, body.captain.collegeName,
    body.captain.department, body.captain.yearOfStudy, body.captain.email, body.captain.phone
  ]);
  (body.members || []).forEach((m, i) => {
    memberRows.push([
      memberIds[i], teamId, m.fullName, m.collegeName, m.department, m.yearOfStudy, m.email, m.phone
    ]);
  });

  // Build Registration Events Batch (Every member for every event)
  const eventRows = [];
  body.events.forEach(sel => {
    allMemberIds.forEach(mid => {
      eventRows.push([
        generateId_('RE'), teamId, mid, sel.id, sel.session, timestamp
      ]);
    });
  });

  // Initialize Payment Data
  const paymentId = generateId_('P');
  const paymentRow = [
    paymentId, teamId, totalAmount, '', '', 'Pending', new Date(), ''
  ];
  const teamRow = [teamId, teamName, createdAt, captainId];

  // 2. Locked Write Phase
  const lock = LockService.getScriptLock();
  try {
    const t_lock = Date.now();
    lock.waitLock(15000);
    console.log('TIMING lock=' + (Date.now() - t_lock) + 'ms');

    const t_mem = Date.now();
    memberSheet.getRange(memberSheet.getLastRow() + 1, 1, memberRows.length, 8).setValues(memberRows);
    console.log('TIMING members=' + (Date.now() - t_mem) + 'ms');

    const t_team = Date.now();
    teamSheet.appendRow(teamRow);
    console.log('TIMING teams=' + (Date.now() - t_team) + 'ms');

    const t_ev = Date.now();
    regEventsSheet.getRange(regEventsSheet.getLastRow() + 1, 1, eventRows.length, 6).setValues(eventRows);
    console.log('TIMING events=' + (Date.now() - t_ev) + 'ms');

    const t_pay = Date.now();
    paymentSheet.appendRow(paymentRow);
    console.log('TIMING payment=' + (Date.now() - t_pay) + 'ms');

  } catch (lockErr) {
    return jsonOut_({ status: 'error', errors: { general: 'Server busy: ' + lockErr.message } });
  } finally {
    lock.releaseLock();
  }

  // 3. Post-Write Phase (Unlocked)
  let emailStatus = 'sent';
  let emailError = '';
  const t_gmail = Date.now();
  try {
    sendConfirmationEmail_(body, teamId);
  } catch (emailErr) {
    emailStatus = 'failed';
    emailError = String(emailErr && emailErr.message ? emailErr.message : emailErr);
    console.error('EMAIL_FAILURE: ' + emailError);
  }
  console.log('TIMING gmail=' + (Date.now() - t_gmail) + 'ms');

  return jsonOut_({
    status: 'success',
    teamId: teamId,
    paymentId: paymentId,
    totalAmount: totalAmount,
    emailStatus: emailStatus,
    emailError: emailError
  });
}

function handlePaymentUpdate(body) {
  const { paymentId, utr } = body;
  if (!paymentId || !utr) return jsonOut_({ status: 'error', errors: { general: 'Missing payment details' } });

  const paymentSheet = getSheet_('Payments');
  const data = paymentSheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === paymentId) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) return jsonOut_({ status: 'error', errors: { general: 'Payment record not found' } });

  paymentSheet.getRange(rowIndex, 4).setValue(utr);
  paymentSheet.getRange(rowIndex, 6).setValue('Pending'); // Always pending until admin verifies
  paymentSheet.getRange(rowIndex, 7).setValue(new Date());

  return jsonOut_({ status: 'success', message: 'Payment details submitted for verification.' });
}


function doGet(e) {
  const key = e && e.parameter ? e.parameter.key : '';
  const adminKey = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!key || key !== adminKey) return jsonOut_({ status: 'error', errors: { general: 'Unauthorized' } });

  const regEventsSheet = getSheet_('RegistrationEvents');
  const data = regEventsSheet.getDataRange().getValues();
  const rows = data.slice(1);

  const perEvent = {};
  rows.forEach(row => {
    const eventId = row[3];
    const session = row[4];
    const sessionName = { 'FULL_DAY': 'Full Day', 'MORNING': 'Morning', 'EVENING': 'Evening' }[session] || session;
    const keyStr = `${eventId} (${sessionName})`;
    perEvent[keyStr] = (perEvent[keyStr] || 0) + 1;
  });

  return jsonOut_({
    status: 'success',
    totalRegistrations: rows.length, // This counts total individual participations
    perEvent: perEvent
  });
}

/**
 * TEMPORARY DIAGNOSTIC FUNCTION
 * Used to verify Gmail sending capabilities independently of the registration flow.
 *
 * INSTRUCTIONS:
 * 1. Replace 'YOUR_EMAIL@gmail.com' with your actual email address.
 * 2. Save the script.
 * 3. Select 'testJarvisEmail' from the function dropdown in the editor.
 * 4. Click 'Run'.
 * 5. Authorize the script if prompted.
 * 6. Check Inbox, Spam, and Promotions folders.
 */
function testJarvisEmail() {
  const testEmail = 'YOUR_EMAIL@gmail.com';

  GmailApp.sendEmail(
    testEmail,
    'JARVIS 2K26 - Email Test',
    'This is a test email from the JARVIS 2K26 Apps Script backend.',
    {
      htmlBody: `
        <h2 style="color: #1a1a1a;">JARVIS 2K26</h2>
        <p>This is a test email.</p>
        <p>If you received this message, Gmail sending is working correctly.</p>
      `
    }
  );

  console.log('JARVIS EMAIL TEST COMPLETED');
}

