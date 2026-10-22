import { ADMIN_GAS_URL } from '../config/adminGasConfig';

/**
 * Admin API Service
 * Handles communication with the Admin GAS Backend.
 *
 * Uses "Simple Requests" (no Content-Type: application/json) to avoid
 * CORS preflight OPTIONS requests, which Google Apps Script does not support.
 */
async function request(payload) {
  try {
    console.log('[ADMIN] API Request starting');
    console.log('[ADMIN] Endpoint:', ADMIN_GAS_URL);
    console.log('[ADMIN] Payload:', JSON.stringify(payload));

    const response = await fetch(ADMIN_GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    console.log('[ADMIN] Fetch response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let result;
    try {
      result = await response.json();
    } catch (parseErr) {
      // Attempt to get raw text for debugging
      const raw = await response.text();
      console.error('[ADMIN] Failed to parse JSON response. Raw response:', raw);
      throw new Error('Invalid JSON response from server');
    }
    console.log('[ADMIN] Parsed JSON result:', result);
    return result;
  } catch (err) {
    console.error('[ADMIN] API Request Error:', err);
    throw err; // Propagate network errors to the component
  }
}

export const adminApi = {
  login: async (username, password) => {
    return request({
      requestType: 'login',
      username,
      password,
    });
  },

  getDashboardStats: async (sessionToken) => {
    return request({
      requestType: 'getDashboardStats',
      sessionToken,
    });
  },

  getRegistrations: async (sessionToken) => {
    return request({
      requestType: 'getRegistrations',
      sessionToken,
    });
  },

  getRegistrationDetails: async (sessionToken, teamId) => {
    return request({
      requestType: 'getRegistrationDetails',
      sessionToken,
      teamId,
    });
  },

  getPayments: async (sessionToken) => {
    return request({
      requestType: 'getPayments',
      sessionToken,
    });
  },

  verifyPayment: async (sessionToken, paymentId) => {
    return request({
      requestType: 'verifyPayment',
      sessionToken,
      paymentId,
    });
  },
  listParticipantPayments: async (sessionToken) => {
    return request({
      requestType: 'listParticipantPayments',
      sessionToken,
    });
  },
  // New: list event IDs to verify schedule vs registration
  listEventIds: async (sessionToken) => {
    return request({
      requestType: 'listEventIds',
      sessionToken,
    });
  },

  // New: send e‑ticket for a verified payment (admin triggers manually)
  sendTicket: async (sessionToken, paymentId) => {
    return request({
      requestType: 'sendTicket',
      sessionToken,
      paymentId,
    });
  },



  getEventParticipants: async (sessionToken, eventId) => {
    return request({
      requestType: 'getEventParticipants',
      sessionToken,
      eventId,
    });
  },
};
