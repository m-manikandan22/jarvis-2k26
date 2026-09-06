/**
 * JARVIS 2K26 Admin Backend
 * SEPARATE PROJECT: Read-Only access to the registration database.
 * Shares the same DATABASE_SPREADSHEET_ID as the Public GAS.
 */

const SESSION_EXPIRY_SECONDS = 7200; // 2 hours

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

// --- Authentication System ---


function verifyCredentials_(username, password) {
  const storedUser = PropertiesService.getScriptProperties().getProperty('ADMIN_USERNAME') || 'admin';
  const storedPass = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');

  if (!storedPass) throw new Error('Admin password not configured in Script Properties.');

  return (username === storedUser && password === storedPass);
}

function createSession_() {
  const token = Utilities.getUuid();
  CacheService.getUserCache().put(token, 'authenticated', SESSION_EXPIRY_SECONDS);
  return token;
}

function isValidSession_(token) {
  if (!token) return false;
  const session = CacheService.getUserCache().get(token);
  return session === 'authenticated';
}

// --- Read-Only API Endpoints ---

function getDashboardStats_() {
  const teamSheet = getSheet_('Teams');
  const memberSheet = getSheet_('Members');
  const paymentSheet = getSheet_('Payments');

  const teams = teamSheet.getDataRange().getValues().slice(1);
  const members = memberSheet.getDataRange().getValues().slice(1);
  const payments = paymentSheet.getDataRange().getValues().slice(1);

  const verifiedPayments = payments.filter(row => row[5] === 'Verified').length;
  const pendingPayments = payments.filter(row => row[5] === 'Pending').length;

  return {
    totalTeams: teams.length,
    totalMembers: members.length,
    totalRegistrations: teams.length,
    verifiedPayments: verifiedPayments,
    pendingPayments: pendingPayments
  };
}

function getRegistrations_() {
  const teamSheet = getSheet_('Teams');
  const teamData = teamSheet.getDataRange().getValues();
  const headers = teamData[0];
  const rows = teamData.slice(1);

  // We also need payment status for each team
  const paymentSheet = getSheet_('Payments');
  const paymentData = paymentSheet.getDataRange().getValues().slice(1);
  const paymentMap = {};
  paymentData.forEach(row => {
    paymentMap[row[1]] = row[5]; // TeamID -> Status
  });

  return rows.map(row => ({
    teamId: row[0],
    teamName: row[1],
    createdAt: row[2],
    paymentStatus: paymentMap[row[0]] || 'Unknown'
  }));
}

function getPayments_() {
  const paymentSheet = getSheet_('Payments');
  const paymentData = paymentSheet.getDataRange().getValues();
  const paymentRows = paymentData.slice(1);

  const teamSheet = getSheet_('Teams');
  const teamData = teamSheet.getDataRange().getValues().slice(1);
  const teamMap = {};
  teamData.forEach(row => {
    teamMap[row[0]] = row[1]; // TeamID -> TeamName
  });

  return paymentRows.map(row => ({
    paymentId: row[0],
    teamId: row[1],
    teamName: teamMap[row[1]] || 'Unknown Team',
    amount: row[2],
    utr: row[3],
    status: row[5],
    paidAt: row[6],
    verifiedAt: row[7]
  }));
}

function getRegistrationDetails_(teamId) {
  const teamSheet = getSheet_('Teams');
  const teamData = teamSheet.getDataRange().getValues();
  const teamRow = teamData.find(row => row[0] === teamId);
  if (!teamRow) throw new Error('Registration not found.');

  const memberSheet = getSheet_('Members');
  const memberData = memberSheet.getDataRange().getValues().slice(1);
  const members = memberData.filter(row => row[1] === teamId).map(row => ({
    memberId: row[0],
    fullName: row[2],
    college: row[3],
    department: row[4],
    year: row[5],
    email: row[6],
    phone: row[7]
  }));

  const regEventsSheet = getSheet_('RegistrationEvents');
  const eventData = regEventsSheet.getDataRange().getValues().slice(1);
  const events = eventData
    .filter(row => row[1] === teamId)
    .map(row => {
      const eventId = row[3];
      // Since EVENT_SCHEDULE is in the other project, we might need to return the ID
      // and let the frontend resolve the title, or we copy EVENT_SCHEDULE here.
      // For consistency, we'll return the ID and session.
      return {
        eventId: eventId,
        session: row[4],
        timestamp: row[5]
      };
    });

  const paymentSheet = getSheet_('Payments');
  const paymentData = paymentSheet.getDataRange().getValues().slice(1);
  const payment = paymentData.find(row => row[1] === teamId);

  return {
    teamId: teamId,
    teamName: teamRow[1],
    captainId: teamRow[3],
    members: members,
    events: events,
    payment: payment ? {
      paymentId: payment[0],
      amount: payment[2],
      utr: payment[3],
      screenshotUrl: payment[4],
      status: payment[5],
      paidAt: payment[6],
      verifiedAt: payment[7]
    } : null
  };
}

function getEventParticipation_() {
  const regEventsSheet = getSheet_('RegistrationEvents');
  const data = regEventsSheet.getDataRange().getValues().slice(1);

  const counts = {};
  data.forEach(row => {
    const key = `${row[3]}|${row[4]}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

function getEventParticipants_(eventId) {
  const regEventsSheet = getSheet_('RegistrationEvents');
  const eventData = regEventsSheet.getDataRange().getValues().slice(1);

  const teamSheet = getSheet_('Teams');
  const teamData = teamSheet.getDataRange().getValues().slice(1);
  const teamMap = {};
  teamData.forEach(row => {
    teamMap[row[0]] = row[1]; // TeamID -> TeamName
  });

  const memberSheet = getSheet_('Members');
  const memberData = memberSheet.getDataRange().getValues().slice(1);
  const memberMap = {};
  memberData.forEach(row => {
    memberMap[row[0]] = {
      fullName: row[2],
      email: row[6],
      phone: row[7]
    };
  });

  const participants = eventData
    .filter(row => row[3] === eventId)
    .map(row => {
      const teamId = row[1];
      const memberId = row[2];
      const member = memberMap[memberId] || {};

      return {
        fullName: member.fullName || 'Unknown',
        email: member.email || 'Unknown',
        phone: member.phone || 'Unknown',
        teamName: teamMap[teamId] || 'Unknown Team',
        teamId: teamId,
        session: row[4]
      };
    });

  return participants;
}

function sendETicketEmail_(teamId) {
  const details = getRegistrationDetails_(teamId);
  const members = details.members;
  const emails = members.map(m => String(m.email || '').trim().toLowerCase()).filter(e => e && e.includes('@'));
  const uniqueEmails = [...new Set(emails)];

  if (uniqueEmails.length === 0) return;

  const teamName = details.teamName;

  const eventListHtml = details.events.map(sel => {
    const sched = EVENT_SCHEDULE[sel.eventId];
    return `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">${sched ? sched.title : 'Event ' + sel.eventId}</td>
        <td style="padding: 10px;">${sel.session.replace('_', ' ')}</td>
        <td style="padding: 10px;">${sched ? sched.venue : 'TBA'}</td>
      </tr>`;
  }).join('');

  const membersListHtml = members.map(m => `<li>${m.fullName}</li>`).join('');

  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden; color: #333;">
      <div style="background-color: #000; color: #ffffff; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">JARVIS 2K26</h1>
        <p style="margin: 5px 0 0; font-size: 16px; opacity: 0.8;">OFFICIAL E-TICKET</p>
      </div>
      <div style="padding: 30px; line-height: 1.6;">
        <p>Congratulations!</p>
        <p>Your payment has been verified, and your registration for <strong>JARVIS 2K26</strong> is now fully confirmed.</p>

        <div style="background-color: #f9f9f9; border-left: 4px solid #000; padding: 20px; margin: 25px 0; text-align: center;">
          <span style="display: block; font-size: 14px; color: #666; margin-bottom: 5px;">Registration ID</span>
          <strong style="font-size: 22px; color: #000; font-family: monospace;">${teamId}</strong>
        </div>

        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; color: #000;">Team Details</h3>
        <p style="margin: 5px 0;"><strong>Team Name:</strong> ${teamName}</p>

        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 25px; color: #000;">Your Registered Events</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
          <thead style="background-color: #f2f2f2; text-align: left;">
            <tr>
              <th style="padding: 10px; border: 1px solid #ddd;">Event</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Session</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Venue</th>
            </tr>
          </thead>
          <tbody>
            ${eventListHtml}
          </tbody>
        </table>

        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 25px; color: #000;">Team Members</h3>
        <ul style="padding-left: 20px; margin: 10px 0;">
          ${membersListHtml}
        </ul>

        <div style="margin-top: 30px; padding: 20px; background-color: #e6fffa; border: 1px solid #b2f5ea; border-radius: 4px; font-size: 14px; text-align: center;">
          <strong>Please present this email or your Registration ID at the venue for entry.</strong>
        </div>
      </div>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 13px; color: #888;">
        <p style="margin: 0;"><strong>JARVIS 2K26 Team</strong><br>PMCTECH</p>
      </div>
    </div>
  `;

  const textFallback = `
JARVIS 2K26 - Official E-Ticket
Registration ID: ${teamId}

Congratulations! Your payment has been verified.

Team: ${teamName}
Events: ${details.events.map(e => e.eventId).join(', ')}

Please keep this email for entry.
JARVIS 2K26 Team, PMCTECH
  `.trim();

  uniqueEmails.forEach(email => {
    try {
      GmailApp.sendEmail(email, `JARVIS 2K26 — Official E-Ticket — ${teamId}`, textFallback, {
        htmlBody: htmlTemplate
      });
    } catch (e) {
      console.error('ETICKET_EMAIL_ERROR: ' + e.message);
    }
  });
}

function updatePaymentStatus_(paymentId, status) {
  const paymentSheet = getSheet_('Payments');
  const data = paymentSheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === paymentId) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) throw new Error('Payment record not found.');

  const currentStatus = data[rowIndex - 1][5];
  if (currentStatus === 'Verified' || currentStatus === 'Rejected') {
    throw new Error(`Payment is already ${currentStatus}.`);
  }

  const verifiedAt = status === 'Verified' ? new Date() : '';

  // Col 6: Status, Col 8: VerifiedAt
  paymentSheet.getRange(rowIndex, 6).setValue(status);
  paymentSheet.getRange(rowIndex, 8).setValue(verifiedAt);

  return { status: 'success', newStatus: status };
}

// --- Main API ---

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const requestType = body.requestType;
    const sessionToken = body.sessionToken;

    if (requestType === 'login') {
      const { username, password } = body;
      if (verifyCredentials_(username, password)) {
        const token = createSession_();
        return jsonOut_({ status: 'success', sessionToken: token });
      }
      return jsonOut_({ status: 'error', message: 'Invalid credentials' });
    }

    // All other endpoints require a valid session token
    if (!isValidSession_(sessionToken)) {
      return jsonOut_({ status: 'error', message: 'Unauthorized or session expired' });
    }

    switch (requestType) {
      case 'getDashboardStats':
        return jsonOut_({ status: 'success', data: getDashboardStats_() });
      case 'getRegistrations':
        return jsonOut_({ status: 'success', data: getRegistrations_() });
      case 'getPayments':
        return jsonOut_({ status: 'success', data: getPayments_() });
      case 'getRegistrationDetails':
        if (!body.teamId) return jsonOut_({ status: 'error', message: 'teamId is required' });
        return jsonOut_({ status: 'success', data: getRegistrationDetails_(body.teamId) });
      case 'getEventParticipation':
        return jsonOut_({ status: 'success', data: getEventParticipation_() });
      case 'getEventParticipants':
        if (!body.eventId) return jsonOut_({ status: 'error', message: 'eventId is required' });
        return jsonOut_({ status: 'success', data: getEventParticipants_(body.eventId) });
      case 'verifyPayment':
        if (!body.paymentId) return jsonOut_({ status: 'error', message: 'paymentId is required' });
        try {
          const lock = LockService.getScriptLock();
          lock.waitLock(15000);
          const result = updatePaymentStatus_(body.paymentId, 'Verified');
          lock.releaseLock();

          // Trigger E-Ticket Email
          try {
            const paymentSheet = getSheet_('Payments');
            const pData = paymentSheet.getDataRange().getValues();
            const pRow = pData.find(row => row[0] === body.paymentId);
            if (pRow) {
              sendETicketEmail_(pRow[1]); // pRow[1] is TeamID
            }
          } catch (emailErr) {
            console.error('E-TICKET_TRIGGER_ERROR: ' + emailErr.message);
            // We don't throw here because payment was already verified
          }

          return jsonOut_({ status: 'success', message: 'Payment verified and e-ticket sent successfully.' });
        } catch (err) {
          return jsonOut_({ status: 'error', message: err.message });
        }
      case 'rejectPayment':
        if (!body.paymentId) return jsonOut_({ status: 'error', message: 'paymentId is required' });
        try {
          const lock = LockService.getScriptLock();
          lock.waitLock(15000);
          const result = updatePaymentStatus_(body.paymentId, 'Rejected');
          lock.releaseLock();
          return jsonOut_({ status: 'success', message: 'Payment rejected successfully.' });
        } catch (err) {
          return jsonOut_({ status: 'error', message: err.message });
        }
      default:
        return jsonOut_({ status: 'error', message: 'Invalid request type' });
    }

  } catch (err) {
    return jsonOut_({ status: 'error', message: 'Server error: ' + err.message });
  }
}
