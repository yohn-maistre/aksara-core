// Adapted from Mastra Code SDK, c6a8570543f716d8a0edd70001abd0b89d365a74, Apache-2.0.
// See third_party/mastra-code/LICENSE and UPSTREAM.md.
const oauthFetch = (url, options) => fetch(url, { ...options, redirect: 'error' });
const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
const ISSUER = 'https://auth.openai.com';
const AUTHORIZE_URL = `${ISSUER}/oauth/authorize`;
const TOKEN_URL = `${ISSUER}/oauth/token`;
const DEVICE_USER_CODE_URL = `${ISSUER}/api/accounts/deviceauth/usercode`;
const DEVICE_TOKEN_URL = `${ISSUER}/api/accounts/deviceauth/token`;
const DEVICE_AUTHORIZE_URL = `${ISSUER}/codex/device`;
const DEVICE_REDIRECT_URI = `${ISSUER}/deviceauth/callback`;
const DEFAULT_CALLBACK_PORT = 1455;
const FALLBACK_CALLBACK_PORT = 1457;
const DEFAULT_TOKEN_EXPIRES_IN_SECONDS = 3600;
const DEVICE_AUTH_TIMEOUT_MS = 15 * 60 * 1000;
const OAUTH_REQUEST_TIMEOUT_MS = 15_000;
const SCOPE = 'openid profile email offline_access api.connectors.read api.connectors.invoke';
const JWT_CLAIM_PATH = 'https://api.openai.com/auth';
function requestSignal(signal) {
    const timeout = AbortSignal.timeout(OAUTH_REQUEST_TIMEOUT_MS);
    return signal ? AbortSignal.any([timeout, signal]) : timeout;
}
async function createState() {
    if (typeof process === 'undefined' || !(process.versions?.node || process.versions?.bun)) {
        throw new Error('OpenAI Codex OAuth is only available in Node.js environments');
    }
    return Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(16))).toString('hex');
}
function decodeJwt(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3)
            return null;
        const payload = parts[1] ?? '';
        const padded = payload
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(Math.ceil(payload.length / 4) * 4, '=');
        const decoded = atob(padded);
        return JSON.parse(decoded);
    }
    catch {
        return null;
    }
}
function extractAccountIdFromClaims(payload) {
    if (!payload)
        return null;
    const accountId = payload.chatgpt_account_id ?? payload[JWT_CLAIM_PATH]?.chatgpt_account_id;
    return typeof accountId === 'string' && accountId.length > 0 ? accountId : null;
}
function getAccountId(tokens, fallback) {
    const fromIdToken = tokens.idToken ? extractAccountIdFromClaims(decodeJwt(tokens.idToken)) : null;
    if (fromIdToken)
        return fromIdToken;
    const fromAccessToken = extractAccountIdFromClaims(decodeJwt(tokens.access));
    if (fromAccessToken)
        return fromAccessToken;
    return fallback;
}
function requireAccountId(tokens, fallback) {
    const accountId = getAccountId(tokens, fallback);
    if (!accountId) {
        throw new Error('Failed to extract ChatGPT account id from OpenAI Codex token');
    }
    return accountId;
}
function extractEmailFromClaims(payload) {
    const email = payload.email ?? payload[JWT_CLAIM_PATH]?.email;
    return typeof email === 'string' && email.length > 0 ? email : null;
}
function getEmailFromTokens(tokens) {
    const fromIdToken = tokens.idToken ? extractEmailFromClaims(decodeJwt(tokens.idToken) ?? {}) : null;
    if (fromIdToken)
        return fromIdToken;
    const fromAccessToken = extractEmailFromClaims(decodeJwt(tokens.access) ?? {});
    return fromAccessToken ?? undefined;
}
function tokenResponseToResult(json, logPrefix) {
    if (!json.access_token || !json.refresh_token) {
        return { type: 'failed' };
    }
    return {
        type: 'success',
        access: json.access_token,
        refresh: json.refresh_token,
        expires: Date.now() + (json.expires_in ?? DEFAULT_TOKEN_EXPIRES_IN_SECONDS) * 1000,
        idToken: json.id_token,
    };
}
async function exchangeAuthorizationCode(code, verifier, redirectUri, signal) {
    const response = await oauthFetch(TOKEN_URL, {
        method: 'POST',
        signal: requestSignal(signal),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            code,
            code_verifier: verifier,
            redirect_uri: redirectUri,
        }),
    });
    if (!response.ok) {
        return { type: 'failed' };
    }
    return tokenResponseToResult((await response.json()), 'token');
}
async function refreshAccessToken(refreshToken) {
    try {
        const response = await oauthFetch(TOKEN_URL, {
            method: 'POST',
            signal: requestSignal(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: CLIENT_ID,
            }),
        });
        if (!response.ok) {
            return { type: 'failed' };
        }
        return tokenResponseToResult((await response.json()), 'Token refresh');
    }
    catch {
        return { type: 'failed' };
    }
}
/**
 * Start a Codex device-code login: request a user code and return the
 * serializable pending state for subsequent polls.
 */
export async function startCodexDeviceLogin(options) {
    const response = await oauthFetch(DEVICE_USER_CODE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'mastracode',
        },
        body: JSON.stringify({ client_id: CLIENT_ID, originator: 'mastracode' }),
        signal: requestSignal(options?.signal),
    });
    if (!response.ok) {
        throw new Error(`Failed to initiate OpenAI Codex device authorization: ${response.status}`);
    }
    const deviceData = (await response.json());
    const userCode = deviceData.user_code ?? deviceData.usercode;
    if (!deviceData.device_auth_id || !userCode) {
        throw new Error('OpenAI Codex device authorization response missing required fields');
    }
    const intervalSeconds = typeof deviceData.interval === 'number' ? deviceData.interval : Number.parseInt(deviceData.interval ?? '', 10) || 5;
    return {
        deviceAuthId: deviceData.device_auth_id,
        userCode,
        url: DEVICE_AUTHORIZE_URL,
        instructions: `Enter code: ${userCode}`,
        intervalMs: Math.max(intervalSeconds, 1) * 1000,
        deadlineAt: Date.now() + DEVICE_AUTH_TIMEOUT_MS,
    };
}
/**
 * Perform exactly one upstream poll for a pending Codex device login.
 * The Codex device endpoint signals "still pending" via HTTP 403/404 (it is
 * not an RFC 8628 error-JSON endpoint); on success it returns the
 * authorization code plus server-held PKCE verifier, which we exchange
 * immediately for credentials. Never throws for flow-level conditions.
 */
export async function pollCodexDeviceLogin(pending, options) {
    if (Date.now() >= pending.deadlineAt) {
        return { status: 'failed', error: 'OpenAI Codex device authorization timed out after 15 minutes' };
    }
    const pollResponse = await oauthFetch(DEVICE_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'mastracode',
        },
        body: JSON.stringify({
            device_auth_id: pending.deviceAuthId,
            user_code: pending.userCode,
        }),
        signal: requestSignal(options?.signal),
    });
    if (pollResponse.ok) {
        const data = (await pollResponse.json());
        if (!data.authorization_code || !data.code_verifier) {
            return { status: 'failed', error: 'OpenAI Codex device token response missing required fields' };
        }
        const tokenResult = await exchangeAuthorizationCode(data.authorization_code, data.code_verifier, DEVICE_REDIRECT_URI, options?.signal);
        if (tokenResult.type !== 'success') {
            return { status: 'failed', error: 'Token exchange failed' };
        }
        let accountId;
        try {
            accountId = requireAccountId(tokenResult);
        }
        catch (error) {
            return { status: 'failed', error: error instanceof Error ? error.message : String(error) };
        }
        return {
            status: 'complete',
            credentials: {
                access: tokenResult.access,
                refresh: tokenResult.refresh,
                expires: tokenResult.expires,
                accountId,
                email: getEmailFromTokens(tokenResult),
            },
        };
    }
    if (pollResponse.status !== 403 && pollResponse.status !== 404) {
        return {
            status: 'failed',
            error: `OpenAI Codex device authorization failed: ${pollResponse.status}`,
        };
    }
    return { status: 'pending', nextPollMs: pending.intervalMs };
}
export async function refreshOpenAICodexToken(refreshToken, previousAccountId, previousEmail) {
    const result = await refreshAccessToken(refreshToken);
    if (result.type !== 'success') {
        throw new Error('Failed to refresh OpenAI Codex token');
    }
    const accountId = requireAccountId(result, previousAccountId);
    return {
        access: result.access,
        refresh: result.refresh,
        expires: result.expires,
        accountId,
        email: getEmailFromTokens(result) ?? previousEmail,
    };
}
