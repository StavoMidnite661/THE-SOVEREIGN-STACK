// backend/attestor-client.js
require('dotenv').config();
const axios = require('axios');

const ATTESTOR_SERVICE_URL = process.env.ATTESTOR_SERVICE_URL || 'http://localhost:4002';

async function requestAttestation(payload) {
  // payload: { requestId, wallet, amount, merchantId, orderId, timestamp }
  // In prod, this endpoint should authenticate backend and return structured signature object.
  try {
      const resp = await axios.post(`${ATTESTOR_SERVICE_URL}/sign`, { payload });
      // expected resp.data = { signature, signer, expiresAt, rawPayload }
      return resp.data;
  } catch (error) {
      console.error("Attestation request failed. Using mock attestation for DEV.");
      // Fallback for dev if attestor service not running
      return {
          signature: "0x_mock_signature_" + Date.now(),
          signer: "0x_mock_signer",
          expiresAt: Math.floor(Date.now()/1000) + 3600,
          rawPayload: payload
      };
  }
}

module.exports = { requestAttestation };
