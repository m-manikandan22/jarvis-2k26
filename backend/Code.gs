/**
 * JARVIS 2K26 Admin Backend - PRODUCTION VERSION
 * Handles payment verification and automatic E-Ticket delivery.
 */

const SESSION_EXPIRY_SECONDS = 7200; // 2 hours

// Event schedule mapping – keys must exactly match the event IDs stored in the 'RegistrationEvents' sheet (column D).
const EVENT_SCHEDULE = {
  'technova': { title: 'PAPER PRESENTAION', session: 'FULL_DAY', venue: 'Auditorium' },
  'coderelay': { title: 'RELAY CODING', session: 'MORNING', venue: 'NH1' },
  'funfiesta': { title: 'CARNIVAL', session: 'MORNING', venue: 'NH2' },
  'listenlink': { title: 'MYSTRY BOX', session: 'MORNING', venue: 'NH3' },
  'bytebattles': { title: 'TECH DEBATE', session: 'MORNING', venue: 'NH4' },
  'cyberarena': { title: 'E-SPORTS', session: 'FULL_DAY', venue: 'NH5' },
  'hackonomics': { title: 'GUESS THE TECHIES', session: 'EVENING', venue: 'NH1' },
  'aiwhisperer': { title: 'PROMPT ENGG BATTLE', session: 'EVENING', venue: 'NH2' },
  'corporatequest': { title: 'HR INTERVIEW', session: 'EVENING', venue: 'NH3' },
  'chaosroom': { title: 'THE CHAOS ROOM', session: 'EVENING', venue: 'NH4' },
};

function esc_(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// --- Utilities ---

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_(name) {
  const ss = getDatabaseSpreadsheet_();
  return ss.getSheetByName(name);
}

function getDatabaseSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const ssId = props.getProperty('DATABASE_SPREADSHEET_ID');
  if (!ssId) throw new Error('DATABASE_SPREADSHEET_ID is not configured in Script Properties.');

  const ss = SpreadsheetApp.openById(ssId);
  if (!ss) throw new Error('Failed to open spreadsheet with provided ID.');

  return ss;
}

// --- Authentication ---

function verifyCredentials_(username, password) {
  const storedUser = PropertiesService.getScriptProperties().getProperty('ADMIN_USERNAME') || 'admin';
  const storedPass = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!storedPass) throw new Error('Admin password not configured.');
  return (String(username || '').trim() === String(storedUser).trim() &&
          String(password || '').trim() === String(storedPass).trim());
}

function createSession_() {
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put(token, 'authenticated', SESSION_EXPIRY_SECONDS);
  return token;
}

function isValidSession_(token) {
  if (!token) return false;
  return CacheService.getScriptCache().get(token) === 'authenticated';
}

// --- API Endpoints ---

function getDashboardStats_() {
  const teams = getSheet_('Teams').getDataRange().getValues().slice(1);
  const members = getSheet_('Members').getDataRange().getValues().slice(1);
  const payments = getSheet_('Payments').getDataRange().getValues().slice(1);
  return {
    totalTeams: teams.length,
    totalMembers: members.length,
    totalRegistrations: teams.length,
    verifiedPayments: payments.filter(row => row[5] === 'Verified').length,
    pendingPayments: payments.filter(row => row[5] === 'Pending').length
  };
}

function buildMemberEmailSet_() {
  const members = getSheet_('Members').getDataRange().getValues().slice(1);
  const emailSet = new Set();
  members.forEach(row => {
    const email = String(row[6] || '').trim().toLowerCase();
    if (email) emailSet.add(email);
  });
  return emailSet;
}
function getRegistrations_() {
  const teamData = getSheet_('Teams').getDataRange().getValues();
  const rows = teamData.slice(1);
  const paymentData = getSheet_('Payments').getDataRange().getValues().slice(1);
  const paymentMap = {};
  paymentData.forEach(row => { paymentMap[row[1]] = row[5]; });
  return rows.map(row => ({
    teamId: row[0],
    teamName: row[1],
    createdAt: row[2],
    paymentStatus: paymentMap[row[0]] || 'Unknown'
  }));
}

function getPayments_() {
  const paymentRows = getSheet_('Payments').getDataRange().getValues().slice(1);
  const teamData = getSheet_('Teams').getDataRange().getValues().slice(1);
  const teamMap = {};
  teamData.forEach(row => { teamMap[row[0]] = row[1]; });
  return paymentRows.map(row => ({
    paymentId: row[0],
    teamId: row[1],
    teamName: teamMap[row[1]] || 'Unknown Team',
    amount: row[2],
    utr: String(row[3] == null ? '' : row[3]),
    status: row[5],
    paidAt: row[6],
    verifiedAt: row[7]
  }));
}

function getRegistrationDetails_(teamId) {
  const teamSheet = getSheet_('Teams');
  const teamRow = teamSheet.getDataRange().getValues().find(row => row[0] === teamId);
  if (!teamRow) throw new Error('Registration not found.');

  // Build email lookup set for matching
  const emailSet = buildMemberEmailSet_();

  const members = getSheet_('Members').getDataRange().getValues().slice(1)
    .filter(row => row[1] === teamId)
    .map(row => {
      const emailNorm = String(row[6] || '').trim().toLowerCase();
      return {
        memberId: row[0],
        fullName: row[2],
        college: row[3],
        department: row[4],
        year: row[5],
        email: row[6],
        phone: row[7],
        isMember: emailSet.has(emailNorm)
      };
    });

  const events = getSheet_('RegistrationEvents').getDataRange().getValues().slice(1)
    .filter(row => row[1] === teamId)
    .map(row => ({ eventId: row[3], session: row[4], timestamp: row[5] }));

  const payment = getSheet_('Payments').getDataRange().getValues().slice(1).find(row => row[1] === teamId);

  return {
    teamId,
    teamName: teamRow[1],
    captainId: teamRow[3],
    members,
    events,
    payment: payment ? { paymentId: payment[0], amount: payment[2], utr: String(payment[3] == null ? '' : payment[3]), screenshotUrl: payment[4], status: payment[5], paidAt: payment[6], verifiedAt: payment[7] } : null
  };
}

function sendETicketEmail_(teamId) {
  const details = getRegistrationDetails_(teamId);
  const captain = details.members.find(m => m.memberId === details.captainId) || details.members[0];
  const captainEmail = captain ? String(captain.email || '').trim().toLowerCase() : '';

  if (!captainEmail || !captainEmail.includes('@')) {
    return { sent: false, reason: 'Captain email is missing or invalid.' };
  }

  const eventListHtml = details.events.map(sel => {
    const sched = EVENT_SCHEDULE[sel.eventId];
    return `<tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; font-weight: bold;">${esc_(sched ? sched.title : 'Event ' + sel.eventId)}</td>
      <td style="padding: 10px;">${esc_(String(sel.session).replace('_', ' '))}</td>
      <td style="padding: 10px;">${esc_(sched ? sched.venue : 'TBA')}</td>
    </tr>`;
  }).join('');

  const membersListHtml = details.members.map(m => `<li>${esc_(m.fullName)}${m.memberId === details.captainId ? ' (Captain)' : ''}</li>`).join('');

  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; color: #333;">
      <div style="background-color: #000; color: #ffffff; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">JARVIS 2K26</h1>
        <p style="margin: 5px 0 0; font-size: 16px; opacity: 0.8;">OFFICIAL E-TICKET</p>
      </div>
      <div style="padding: 30px; line-height: 1.6;">
        <p>Hi ${esc_(captain.fullName)},</p>
        <p>Congratulations!</p>
        <p>Your payment has been verified, and your registration for <strong>JARVIS 2K26</strong> is now fully confirmed.</p>
          <div style="margin-top: 20px; text-align: center;">
            <img src="${'https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent(teamId) + '\u0026size=150x150'}" alt="QR Code" style="width:150px;height:150px;" />
          </div>
        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; color: #000;">Team Details</h3>
        <p style="margin: 5px 0;"><strong>Team Name:</strong> ${esc_(details.teamName)}</p>
        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 25px; color: #000;">Your Registered Events</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
          <thead style="background-color: #f2f2f2; text-align: left;">
            <tr><th style="padding: 10px; border: 1px solid #ddd;">Event</th><th style="padding: 10px; border: 1px solid #ddd;">Session</th><th style="padding: 10px; border: 1px solid #ddd;">Venue</th></tr>
          </thead>
          <tbody>${eventListHtml}</tbody>
        </table>
        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 25px; color: #000;">Team Members</h3>
        <ul style="padding-left: 20px; margin: 10px 0;">${membersListHtml}</ul>
        <div style="margin-top: 30px; padding: 20px; background-color: #e6fffa; border: 1px solid #b2f5ea; border-radius: 4px; font-size: 14px; text-align: center;">
          <strong>Please present this email or your Registration ID at the venue for entry.</strong>
        </div>
      </div>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 13px; color: #888;">
        <p style="margin: 0;"><strong>JARVIS 2K26 Team</strong><br>PMCTECH</p>
      </div>
    </div>`;

  try {
    MailApp.sendEmail({
      to: captainEmail,
      subject: `JARVIS 2K26 - Official E-Ticket - ${teamId}`,
      body: `Registration ID: ${teamId}\nTeam: ${details.teamName}\nYour payment is verified. Please keep this email for entry.`,
      htmlBody: htmlTemplate,
      name: 'JARVIS 2K26'
    });
    return { sent: true, to: captainEmail };
  } catch (e) {
    console.error(`[EMAIL_FAILURE] Team ${teamId}: ${e.message}`);
    return { sent: false, reason: e.message };
  }
}

function updatePaymentStatus_(paymentId, status) {
  const sheet = getSheet_('Payments');
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === paymentId) + 1;
  if (rowIndex <= 1) throw new Error('Payment record not found.');

  const currentStatus = data[rowIndex - 1][5];
  if (currentStatus === 'Verified' || currentStatus === 'Rejected') {
    throw new Error(`Payment is already ${currentStatus}.`);
  }

  sheet.getRange(rowIndex, 6).setValue(status);
  sheet.getRange(rowIndex, 8).setValue(status === 'Verified' ? new Date() : '');
  return { status: 'success' };
}

function getEventParticipants_(eventId) {
  // Returns an array of participant info for the given eventId.
  // Each object contains: fullName, email, phone, teamName, teamId, session, isMember
  const membersData = getSheet_('Members').getDataRange().getValues().slice(1);
  const eventsData = getSheet_('RegistrationEvents').getDataRange().getValues().slice(1);
  const teamsData = getSheet_('Teams').getDataRange().getValues().slice(1);

  // Build email lookup set for matching
  const emailSet = buildMemberEmailSet_();

  // Build maps for quick lookup
  const memberMap = {};
  membersData.forEach(row => {
    const memberId = row[0];
    const email = String(row[6] || '').trim().toLowerCase();
    memberMap[memberId] = {
      fullName: row[2] || '',
      email: row[6] || '',
      phone: row[7] || '',
      isMember: emailSet.has(email)
    };
  });

  const teamMap = {};
  teamsData.forEach(row => {
    const teamId = row[0];
    teamMap[teamId] = row[1] || '';
  });

  const participants = [];
  eventsData.forEach(row => {
    const evId = row[3];
    if (evId !== eventId) return;
    const teamId = row[1];
    const memberId = row[2];
    const memberInfo = memberMap[memberId] || { fullName: '', email: '', phone: '', isMember: false };
    participants.push({
      fullName: memberInfo.fullName,
      email: memberInfo.email,
      phone: memberInfo.phone,
      teamName: teamMap[teamId] || '',
      teamId: teamId,
      session: row[4] || '',
      isMember: memberInfo.isMember
    });
  });

  return participants;
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const { requestType, sessionToken } = body;

  try {
    if (requestType === 'login') {
      if (verifyCredentials_(body.username, body.password)) {
        return jsonOut_({ status: 'success', sessionToken: createSession_() });
      }
      return jsonOut_({ status: 'error', message: 'Invalid credentials' });
    }

    if (!isValidSession_(sessionToken)) {
      return jsonOut_({ status: 'error', message: 'Unauthorized or session expired' });
    }

    switch (requestType) {
      case 'getDashboardStats': return jsonOut_({ status: 'success', data: getDashboardStats_() });
      case 'getRegistrations': return jsonOut_({ status: 'success', data: getRegistrations_() });
      case 'getPayments': return jsonOut_({ status: 'success', data: getPayments_() });
      case 'getRegistrationDetails': return jsonOut_({ status: 'success', data: getRegistrationDetails_(body.teamId) });
      case 'verifyPayment': {
        const pId = body.paymentId;
        if (!pId) return jsonOut_({ status: 'error', message: 'paymentId required' });

        try {
          const lock = LockService.getScriptLock();
          lock.waitLock(10000);
          updatePaymentStatus_(pId, 'Verified');
          lock.releaseLock();
        } catch (err) {
          return jsonOut_({ status: 'error', message: err.message });
        }

        // NOTE: Email sending is now handled manually via the "sendTicket" endpoint.
        return jsonOut_({ status: 'success', message: 'Payment status updated to Verified.' });
      }
      case 'verifyPaymentByEmail': {
        const email = (body.email || '').trim().toLowerCase();
        if (!email) return jsonOut_({ status: 'error', message: 'email is required' });
        // Find member with matching email
        const members = getSheet_('Members').getDataRange().getValues().slice(1);
        const memberRow = members.find(row => String(row[6] || '').trim().toLowerCase() === email);
        if (!memberRow) return jsonOut_({ status: 'error', message: 'No member found with that email' });
        const teamId = memberRow[1];
        // Find payment row for this team
        const payments = getSheet_('Payments').getDataRange().getValues();
        const paymentRowIndex = payments.findIndex(row => row[1] === teamId);
        if (paymentRowIndex <= 0) return jsonOut_({ status: 'error', message: 'No payment record found for this team' });
        const currentStatus = payments[paymentRowIndex][5];
        if (currentStatus === 'Verified') return jsonOut_({ status: 'error', message: 'Payment already verified' });
        // Update status with lock
        try {
          const lock = LockService.getScriptLock();
          lock.waitLock(10000);
          const sheet = getSheet_('Payments');
          const rowIdx = paymentRowIndex + 1; // include header row
          sheet.getRange(rowIdx, 6).setValue('Verified');
          sheet.getRange(rowIdx, 8).setValue(new Date());
          lock.releaseLock();
        } catch (err) {
          return jsonOut_({ status: 'error', message: err.message });
        }
        return jsonOut_({ status: 'success', message: 'Payment verified by email.' });
      }
      case 'sendTicket': {
        const { paymentId } = body;
        if (!paymentId) return jsonOut_({ status: 'error', message: 'paymentId required' });
        const payments = getSheet_('Payments').getDataRange().getValues();
        const paymentRowIndex = payments.findIndex(row => row[0] === paymentId);
        if (paymentRowIndex <= 0) return jsonOut_({ status: 'error', message: 'Payment not found' });
        const status = payments[paymentRowIndex][5];
        if (status !== 'Verified') return jsonOut_({ status: 'error', message: 'Payment not verified yet' });
        const teamId = payments[paymentRowIndex][1];
        const mailResult = sendETicketEmail_(teamId);
        return jsonOut_(mailResult);
        }
        case 'listEventIds': {
          // Returns the set of event IDs defined in the schedule and those actually registered.
          const scheduleIds = Object.keys(EVENT_SCHEDULE);
          const sheet = getSheet_('RegistrationEvents');
          const rows = sheet.getDataRange().getValues().slice(1);
          const registeredIds = [...new Set(rows.map(r => r[3]))];
          return jsonOut_({ status: 'success', data: { scheduleIds, registeredIds } });
        }
        case 'getEventParticipants': {
          const { eventId } = body;
          if (!eventId) return jsonOut_({ status: 'error', message: 'eventId required' });
          if (!EVENT_SCHEDULE.hasOwnProperty(eventId)) return jsonOut_({ status: 'error', message: 'Invalid event ID' });
          const participants = getEventParticipants_(eventId);
          return jsonOut_({ status: 'success', data: participants });
        }

       case 'rejectPayment': {
        updatePaymentStatus_(body.paymentId, 'Rejected');
        return jsonOut_({ status: 'success', message: 'Payment rejected.' });
      }
      default: return jsonOut_({ status: 'error', message: 'Invalid request type' });
    }
  } catch (err) {
    return jsonOut_({ status: 'error', message: 'Server error: ' + err.message });
  }
}

function authorizeEmail() {
  const me = Session.getEffectiveUser().getEmail();
  MailApp.sendEmail({ to: me, subject: 'JARVIS Admin - Prod Test', body: 'Email system is authorized.' });
  Logger.log('Authorization successful. Test mail sent to ' + me);
}
