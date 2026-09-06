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

    const result = await response.json();
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

  rejectPayment: async (sessionToken, paymentId) => {
    return request({
      requestType: 'rejectPayment',
      sessionToken,
      paymentId,
    });
  },
};
