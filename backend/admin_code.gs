/**
 * JARVIS 2K26 Admin Backend
 * SEPARATE PROJECT: Read-Only access to the registration database.
 * Shares the same DATABASE_SPREADSHEET_ID as the Public GAS.
 */

const SESSION_EXPIRY_SECONDS = 7200; // 2 hours

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
      case 'getRegistrationDetails':
        if (!body.teamId) return jsonOut_({ status: 'error', message: 'teamId is required' });
        return jsonOut_({ status: 'success', data: getRegistrationDetails_(body.teamId) });
      case 'getEventParticipation':
        return jsonOut_({ status: 'success', data: getEventParticipation_() });
      default:
        return jsonOut_({ status: 'error', message: 'Invalid request type' });
    }

  } catch (err) {
    return jsonOut_({ status: 'error', message: 'Server error: ' + err.message });
  }
}
