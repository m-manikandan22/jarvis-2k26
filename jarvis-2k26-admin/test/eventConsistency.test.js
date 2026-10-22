import assert from 'assert';
import { ADMIN_GAS_URL } from '../src/config/adminGasConfig.js';
// Use global fetch (Node >=18). If not available, fallback to node-fetch.
const fetchFn = typeof fetch !== 'undefined' ? fetch : (await import('node-fetch')).default;

async function request(payload) {
  const response = await fetchFn(ADMIN_GAS_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return data;
}

// Load frontend schedule mapping (parse the source file)
import fs from 'fs';
import path from 'path';
const eventParticipantsPath = path.resolve('src', 'components', 'EventParticipants.jsx');
const fileContent = fs.readFileSync(eventParticipantsPath, 'utf-8');
const scheduleMatch = fileContent.match(/const EVENT_SCHEDULE = \{([\s\S]*?)\};/);
assert(scheduleMatch, 'EVENT_SCHEDULE not found in EventParticipants.jsx');
const scheduleObjectString = scheduleMatch[1];
// Extract keys using regex
const frontendIds = [];
scheduleObjectString.replace(/'([^']+)'\s*:/g, (_, id) => { frontendIds.push(id); return ''; });

(async () => {
  console.log('=== Event ID Consistency Tests ===');
  // 1. Login to obtain session token (credentials from env)
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  assert(username && password, 'Set ADMIN_USERNAME and ADMIN_PASSWORD env variables');
  const loginRes = await request({ requestType: 'login', username, password });
  assert.strictEqual(loginRes.status, 'success', 'Login failed: ' + loginRes.message);
  const token = loginRes.sessionToken;

  // 2. Get listEventIds from backend
  const listRes = await request({ requestType: 'listEventIds', sessionToken: token });
  assert.strictEqual(listRes.status, 'success', 'listEventIds failed: ' + listRes.message);
  const { scheduleIds, registeredIds } = listRes.data;

  // 3. Verify that frontend and backend schedule IDs match exactly
  const backendIds = scheduleIds.sort();
  const frontendSorted = frontendIds.sort();
  assert.deepStrictEqual(backendIds, frontendSorted, 'Mismatch between backend and frontend schedule IDs');
  console.log('✔ Frontend and backend schedule IDs match');

  // 4. Verify that backend returns error for unknown event ID
  const invalidRes = await request({ requestType: 'getEventParticipants', sessionToken: token, eventId: 'unknown_event' });
  assert.strictEqual(invalidRes.status, 'error', 'Invalid event ID should return error');
  console.log('✔ Invalid event ID correctly rejected');

  // 5. Optionally, verify that registered IDs are a subset of schedule IDs
  const unknownRegistered = registeredIds.filter(id => !backendIds.includes(id));
  assert.strictEqual(unknownRegistered.length, 0, `Found registered IDs not in schedule: ${unknownRegistered.join(', ')}`);
  console.log('✔ All registered IDs are known schedule IDs');

  console.log('All consistency tests passed');
})();
