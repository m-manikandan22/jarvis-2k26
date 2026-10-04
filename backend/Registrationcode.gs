/**
 * JARVIS 2K26 - REGISTRATION (PUBLIC) BACKEND
 * Deploy as Web App: Execute as "Me", Who has access "Anyone".
 * Script Properties required: DATABASE_SPREADSHEET_ID (setupDB() sets it automatically
 * when this project is bound to the spreadsheet).
 *
 * Requests handled (JSON body sent as text/plain):
 *   calculatePayment -> { status, totalAmount, paymentId, upiId }
 *   registration     -> { status, teamId, paymentId, totalAmount }
 * Errors are returned as { status: 'error', errors: { general: '...' } }.
 *
 * Emails: ONLY the team captain (leader) receives the registration email.
 */

const EVENT_SCHEDULE = {
  technova:       { title: 'TECHNOVA',           session: 'FULL_DAY', venue: 'Auditorium' },
  coderelay:      { title: 'CODE RUSH',          session: 'MORNING',  venue: 'NH1' },
  funfiesta:      { title: 'FUNFEST',            session: 'MORNING',  venue: 'NH2' },
  listenlink:     { title: 'LISTEN & WIN',       session: 'MORNING',  venue: 'NH3' },
  bytebattles:    { title: 'TECH CLASH',         session: 'MORNING',  venue: 'NH4' },
  cyberarena:     { title: 'ARENA X',            session: 'FULL_DAY', venue: 'NH5' },
  hackonomics:    { title: 'BRAINBID',           session: 'EVENING',  venue: 'NH1' },
  aiwhisperer:    { title: 'PROMPT WARS',        session: 'EVENING',  venue: 'NH2' },
  corporatequest: { title: 'THE FINAL ROUND',    session: 'EVENING',  venue: 'NH3' },
  chaosroom:      { title: 'ESCAPE ROOM: CHAOS', session: 'EVENING',  venue: 'NH4' }
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;

// ---------- Utilities ----------

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fail_(message) {
  return jsonOut_({ status: 'error', errors: { general: message } });
}

function esc_(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getDb_() {
  const id = PropertiesService.getScriptProperties().getProperty('DATABASE_SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) throw new Error('DATABASE_SPREADSHEET_ID is not configured.');
  return active;
}

function getConfig_(ss) {
  const sheet = ss.getSheetByName('Config');
  const cfg = {};
  if (!sheet) return cfg;
  sheet.getDataRange().getValues().slice(1).forEach(r => {
    if (r[0]) cfg[String(r[0]).trim()] = r[1];
  });
  return cfg;
}

function calculateTotal_(cfg, events) {
  let prices = {};
  try { prices = JSON.parse(cfg.EVENT_PRICES_JSON || '{}'); } catch (e) { prices = {}; }
  let total = Number(cfg.BASE_TEAM_FEE || 0);
  events.forEach(ev => { total += Number(prices[ev.id] || 0); });
  return total;
}

function newId_(prefix, len) {
  return prefix + Utilities.getUuid().replace(/-/g, '').substring(0, len).toUpperCase();
}

function appendRows_(sheet, rows, textCols) {
  if (!rows.length) return;
  const start = sheet.getLastRow() + 1;
  (textCols || []).forEach(col => sheet.getRange(start, col, rows.length, 1).setNumberFormat('@'));
  sheet.getRange(start, 1, rows.length, rows[0].length).setValues(rows);
}

// ---------- Validation ----------

function normPerson_(p) {
  const s = v => String(v == null ? '' : v).trim();
  p = p || {};
  return {
    fullName: s(p.fullName),
    collegeName: s(p.collegeName),
    department: s(p.department),
    yearOfStudy: s(p.yearOfStudy || '1'),
    email: s(p.email).toLowerCase(),
    phone: s(p.phone)
  };
}

function validateAndNormalize_(body) {
  const teamName = String(body.teamName || '').trim();
  if (!teamName) return { error: 'Team name is required' };

  const captain = normPerson_(body.captain);
  if (!captain.fullName) return { error: 'Captain name is required' };
  if (!captain.collegeName) return { error: 'Captain college name is required' };
  if (!captain.department) return { error: 'Captain department is required' };
  if (!EMAIL_RE.test(captain.email)) return { error: 'Valid captain email is required' };
  if (!/^[0-9]{10,15}$/.test(captain.phone)) return { error: 'Valid captain phone is required' };

  const members = (Array.isArray(body.members) ? body.members : []).map(normPerson_);
  const seenEmails = {};
  seenEmails[captain.email] = true;
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    if (!m.fullName) return { error: 'Member ' + (i + 1) + ': name is required' };
    if (!EMAIL_RE.test(m.email)) return { error: 'Member ' + (i + 1) + ': valid email is required' };
    if (seenEmails[m.email]) return { error: 'Duplicate email in team: ' + m.email };
    seenEmails[m.email] = true;
  }

  const events = [];
  const seenIds = {};
  const seenSessions = {};
  const rawEvents = Array.isArray(body.events) ? body.events : [];
  if (rawEvents.length === 0) return { error: 'Please select at least one event' };
  for (let i = 0; i < rawEvents.length; i++) {
    const id = String(rawEvents[i] && rawEvents[i].id || '').trim();
    const sched = EVENT_SCHEDULE[id];
    if (!sched) return { error: 'Unknown event: ' + id };
    if (seenIds[id]) return { error: 'Event selected twice: ' + sched.title };
    if (seenSessions[sched.session]) return { error: 'Only one event allowed per session (' + sched.session.replace('_', ' ') + ')' };
    seenIds[id] = true;
    seenSessions[sched.session] = true;
    events.push({ id: id, session: sched.session });
  }

  return { clean: { teamName: teamName, captain: captain, members: members, events: events } };
}

// ---------- Handlers ----------

function handleCalculate_(body) {
  const v = validateAndNormalize_(body);
  if (v.error) return fail_(v.error);

  const cfg = getConfig_(getDb_());
  return jsonOut_({
    status: 'success',
    totalAmount: calculateTotal_(cfg, v.clean.events),
    paymentId: newId_('PAY-', 10),
    upiId: cfg.UPI_ID || ''
  });
}

function handleRegistration_(body) {
  const v = validateAndNormalize_(body);
  if (v.error) return fail_(v.error);
  const data = v.clean;

  const utr = String(body.payment && body.payment.utr || '').trim();
  if (!/^[A-Za-z0-9]{6,30}$/.test(utr)) return fail_('Enter a valid UTR / transaction reference');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return fail_('Server is busy. Please try again in a moment.');
  }

  let result;
  try {
    const ss = getDb_();
    const cfg = getConfig_(ss);
    const teamSheet = ss.getSheetByName('Teams');
    const memberSheet = ss.getSheetByName('Members');
    const eventSheet = ss.getSheetByName('RegistrationEvents');
    const paymentSheet = ss.getSheetByName('Payments');

    // Duplicate checks
    const teams = teamSheet.getDataRange().getValues().slice(1);
    const payments = paymentSheet.getDataRange().getValues().slice(1);
    if (teams.some(r => String(r[1]).trim().toLowerCase() === data.teamName.toLowerCase())) {
      return fail_('A team with this name is already registered');
    }
    if (payments.some(r => String(r[3]).trim().toLowerCase() === utr.toLowerCase())) {
      return fail_('This UTR has already been used');
    }

    // IDs
    const existingTeamIds = {};
    teams.forEach(r => { existingTeamIds[r[0]] = true; });
    let teamId;
    do { teamId = newId_('JRV26-', 6); } while (existingTeamIds[teamId]);

    let paymentId = String(body.payment && body.payment.paymentId || '').trim();
    const usedPaymentIds = {};
    payments.forEach(r => { usedPaymentIds[r[0]] = true; });
    if (!/^PAY-[A-Z0-9]{10}$/.test(paymentId) || usedPaymentIds[paymentId]) {
      paymentId = newId_('PAY-', 10);
    }

    const now = new Date();
    const total = calculateTotal_(cfg, data.events);   // always recomputed server-side

    // Build rows
    const everyone = [data.captain].concat(data.members);
    const memberIds = everyone.map(() => newId_('M-', 8));
    const captainMemberId = memberIds[0];

    const teamRow = [[teamId, data.teamName, now, captainMemberId]];
    const memberRows = everyone.map((p, i) => [
      memberIds[i], teamId, p.fullName, p.collegeName, p.department, p.yearOfStudy, p.email, p.phone
    ]);
    const eventRows = [];
    everyone.forEach((p, i) => {
      data.events.forEach(ev => {
        eventRows.push([newId_('RE-', 10), teamId, memberIds[i], ev.id, ev.session, now]);
      });
    });
    const paymentRow = [[paymentId, teamId, total, utr, '', 'Pending', now, '']];

    // Write
    appendRows_(teamSheet, teamRow);
    appendRows_(memberSheet, memberRows, [8]);       // keep phone as text
    appendRows_(eventSheet, eventRows);
    appendRows_(paymentSheet, paymentRow, [4]);      // keep UTR as text
    SpreadsheetApp.flush();

    result = { teamId: teamId, paymentId: paymentId, total: total, utr: utr, data: data };
  } catch (err) {
    console.error('REGISTRATION_ERROR: ' + err.message);
    return fail_('Registration failed: ' + err.message);
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }

  // Email AFTER the lock is released. Failure must never fail the registration.
  try {
    sendRegistrationEmailToCaptain_(result);
  } catch (mailErr) {
    console.error('REGISTRATION_EMAIL_ERROR: ' + mailErr.message);
  }

  return jsonOut_({
    status: 'success',
    teamId: result.teamId,
    paymentId: result.paymentId,
    totalAmount: result.total
  });
}

// ---------- Email (captain / leader only) ----------

function sendRegistrationEmailToCaptain_(r) {
  const d = r.data;
  const to = d.captain.email;
  if (!to || !EMAIL_RE.test(to)) return;

  const eventRows = d.events.map(ev => {
    const s = EVENT_SCHEDULE[ev.id];
    return '<tr style="border-bottom:1px solid #ddd;">' +
      '<td style="padding:10px;font-weight:bold;">' + esc_(s.title) + '</td>' +
      '<td style="padding:10px;">' + esc_(s.session.replace('_', ' ')) + '</td>' +
      '<td style="padding:10px;">' + esc_(s.venue) + '</td></tr>';
  }).join('');

  const memberList = [d.captain].concat(d.members).map((m, i) =>
    '<li>' + esc_(m.fullName) + (i === 0 ? ' (Captain)' : '') + '</li>').join('');

  const html =
    '<div style="font-family:\'Segoe UI\',Tahoma,Verdana,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden;color:#333;">' +
    '<div style="background:#000;color:#fff;padding:30px;text-align:center;">' +
      '<h1 style="margin:0;font-size:24px;letter-spacing:2px;">JARVIS 2K26</h1>' +
      '<p style="margin:5px 0 0;font-size:16px;opacity:.8;">REGISTRATION RECEIVED</p></div>' +
    '<div style="padding:30px;line-height:1.6;">' +
      '<p>Hi ' + esc_(d.captain.fullName) + ',</p>' +
      '<p>We have received your registration for <strong>JARVIS 2K26</strong>. Your payment is now <strong>pending verification</strong>. ' +
      'Once it is approved, your official e-ticket will be emailed to you.</p>' +
      '<div style="background:#f9f9f9;border-left:4px solid #000;padding:20px;margin:25px 0;text-align:center;">' +
        '<span style="display:block;font-size:14px;color:#666;margin-bottom:5px;">Registration ID</span>' +
        '<strong style="font-size:22px;font-family:monospace;">' + esc_(r.teamId) + '</strong></div>' +
      '<p style="margin:5px 0;"><strong>Team Name:</strong> ' + esc_(d.teamName) + '</p>' +
      '<p style="margin:5px 0;"><strong>Amount Paid:</strong> &#8377;' + esc_(r.total) + '</p>' +
      '<p style="margin:5px 0;"><strong>UTR:</strong> ' + esc_(r.utr) + '</p>' +
      '<h3 style="border-bottom:2px solid #eee;padding-bottom:10px;margin-top:25px;">Registered Events</h3>' +
      '<table style="width:100%;border-collapse:collapse;margin:15px 0;font-size:14px;">' +
        '<thead style="background:#f2f2f2;text-align:left;"><tr>' +
        '<th style="padding:10px;border:1px solid #ddd;">Event</th>' +
        '<th style="padding:10px;border:1px solid #ddd;">Session</th>' +
        '<th style="padding:10px;border:1px solid #ddd;">Venue</th></tr></thead>' +
        '<tbody>' + eventRows + '</tbody></table>' +
      '<h3 style="border-bottom:2px solid #eee;padding-bottom:10px;margin-top:25px;">Team Members</h3>' +
      '<ul style="padding-left:20px;margin:10px 0;">' + memberList + '</ul>' +
    '</div>' +
    '<div style="background:#f4f4f4;padding:20px;text-align:center;font-size:13px;color:#888;">' +
      '<p style="margin:0;"><strong>JARVIS 2K26 Team</strong><br>PMCTECH</p></div></div>';

  const text = 'JARVIS 2K26 - Registration Received\n' +
    'Registration ID: ' + r.teamId + '\nTeam: ' + d.teamName + '\nAmount: Rs.' + r.total + '\nUTR: ' + r.utr + '\n' +
    'Events: ' + d.events.map(e => EVENT_SCHEDULE[e.id].title).join(', ') + '\n\n' +
    'Your payment is pending verification. Your e-ticket will be emailed once approved.\nJARVIS 2K26 Team, PMCTECH';

  MailApp.sendEmail({
    to: to,
    subject: 'JARVIS 2K26 - Registration Received - ' + r.teamId,
    body: text,
    htmlBody: html,
    name: 'JARVIS 2K26'
  });
}

// ---------- Entry points ----------

function doGet() {
  return jsonOut_({ status: 'ok', service: 'JARVIS 2K26 registration' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    switch (body.requestType) {
      case 'calculatePayment': return handleCalculate_(body);
      case 'registration':     return handleRegistration_(body);
      default:                 return fail_('Invalid request type');
    }
  } catch (err) {
    return fail_('Server error: ' + err.message);
  }
}