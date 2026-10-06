/**
 * JARVIS 2K26 Admin Backend - PRODUCTION VERSION
 * Handles payment verification and automatic E-Ticket delivery.
 */

const SESSION_EXPIRY_SECONDS = 7200; // 2 hours

const EVENT_SCHEDULE = {
  'technova': { title: 'TECHNOVA', session: 'FULL_DAY', venue: 'Auditorium' },
  'coderelay': { title: 'CODE RUSH', session: 'MORNING', venue: 'NH1' },
  'funfiesta': { title: 'FUNFEST', session: 'MORNING', venue: 'NH2' },
  'listenlink': { title: 'LISTEN & WIN', session: 'MORNING', venue: 'NH3' },
  'bytebattles': { title: 'TECH CLASH', session: 'MORNING', venue: 'NH4' },
  'cyberarena': { title: 'ARENA X', session: 'FULL_DAY', venue: 'NH5' },
  'hackonomics': { title: 'BRAINBID', session: 'EVENING', venue: 'NH1' },
  'aiwhisperer': { title: 'PROMPT WARS', session: 'EVENING', venue: 'NH2' },
  'corporatequest': { title: 'THE FINAL ROUND', session: 'EVENING', venue: 'NH3' },
  'chaosroom': { title: 'ESCAPE ROOM: CHAOS', session: 'EVENING', venue: 'NH4' },
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

  const members = getSheet_('Members').getDataRange().getValues().slice(1)
    .filter(row => row[1] === teamId)
    .map(row => ({ memberId: row[0], fullName: row[2], college: row[3], department: row[4], year: row[5], email: row[6], phone: row[7] }));

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
        <div style="background-color: #f9f9f9; border-left: 4px solid #000; padding: 20px; margin: 25px 0; text-align: center;">
          <span style="display: block; font-size: 14px; color: #666; margin-bottom: 5px;">Registration ID</span>
          <strong style="font-size: 22px; color: #000; font-family: monospace;">${teamId}</strong>
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

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { requestType, sessionToken } = body;

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

        // Automatic E-Ticket Sending
        let mail = { sent: false, reason: 'Unknown error' };
        try {
          const pRow = getSheet_('Payments').getDataRange().getValues().find(row => row[0] === pId);
          if (pRow) mail = sendETicketEmail_(pRow[1]);
        } catch (e) {
          mail = { sent: false, reason: e.message };
        }

        return jsonOut_({
          status: 'success',
          emailSent: mail.sent,
          message: mail.sent ? `Verified. E-ticket sent to captain (${mail.to}).` : `Verified, but email failed: ${mail.reason}`
        });
      }
      case 'resendTicket': {
        const pRow = getSheet_('Payments').getDataRange().getValues().find(row => row[0] === body.paymentId);
        if (!pRow || pRow[5] !== 'Verified') return jsonOut_({ status: 'error', message: 'Only verified payments can resend tickets.' });
        const mail = sendETicketEmail_(pRow[1]);
        return jsonOut_(mail.sent ? { status: 'success', message: `Ticket resent to ${mail.to}` } : { status: 'error', message: mail.reason });
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
