import crypto from 'crypto';

// ============================================================
// Bayse HMAC-SHA256 Authentication
//
// Signing formula (from Bayse docs):
//   payload = {timestamp}.{METHOD}.{path}.{bodyHash}
//   signature = base64( HMAC-SHA256(secretKey, payload) )
//
// bodyHash = SHA-256 hex digest of the raw request body
// If no body → bodyHash is an empty string (payload ends with ".")
// ============================================================

/**
 * Hash a request body with SHA-256.
 * Returns a hex string. If no body, returns empty string.
 */
export function hashBody(body: string | null): string {
    if (!body) return '';
    return crypto.createHash('sha256').update(body).digest('hex');
}

/**
 * Build the signing payload string.
 * Format: {timestamp}.{METHOD}.{path}.{bodyHash}
 */
export function buildPayload(
    timestamp: number,
    method: string,
    path: string,
    bodyHash: string
): string {
    return `${timestamp}.${method.toUpperCase()}.${path}.${bodyHash}`;
}

/**
 * Sign the payload with HMAC-SHA256 using the secret key.
 * Returns a base64-encoded string — this goes in X-Signature header.
 */
export function signPayload(secretKey: string, payload: string): string {
    return crypto
        .createHmac('sha256', secretKey)
        .update(payload)
        .digest('base64');
}

/**
 * Main function: generate all three write auth headers at once.
 * Call this right before making a POST or DELETE request.
 *
 * @param secretKey  - your sk_live_... secret key
 * @param method     - HTTP method: 'POST' or 'DELETE'
 * @param path       - request path e.g. '/v1/pm/events/abc/markets/xyz/orders'
 * @param body       - stringified JSON body, or null if no body
 * @returns object with X-Timestamp and X-Signature values
 */
export function generateWriteAuthHeaders(
    secretKey: string,
    method: string,
    path: string,
    body: string | null
): { 'X-Timestamp': string; 'X-Signature': string } {
    const timestamp = Math.floor(Date.now() / 1000);
    const bodyHash = hashBody(body);
    const payload = buildPayload(timestamp, method, path, bodyHash);
    const signature = signPayload(secretKey, payload);

    return {
        'X-Timestamp': String(timestamp),
        'X-Signature': signature,
    };
}