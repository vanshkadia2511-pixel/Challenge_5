/**
 * _shared.ts — Shared serverless utilities using pure Node.js HTTP APIs.
 * Compatible with Vercel Fluid Functions (Node 26.x) without any polyfills.
 *
 * Uses raw IncomingMessage/ServerResponse with .statusCode and .end()
 * instead of relying on Vercel-injected .status()/.json() helpers.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

export type { IncomingMessage, ServerResponse };

// In-memory rate limiting map: ip -> array of request timestamps (ms)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, recent);
    return false;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

/** Send a JSON response using raw Node.js APIs */
export function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  const body = JSON.stringify(data);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(body);
}

/** Set security headers on the response */
export function applySecurityHeaders(res: ServerResponse, origin = '*'): void {
  const allowedOrigin = process.env.ALLOWED_ORIGIN ?? origin;
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
}

/** Extract client IP address */
export function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() ?? '127.0.0.1';
  }
  return req.socket.remoteAddress ?? '127.0.0.1';
}

/** Read raw body with 64 KB size cap */
export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = '';
    const MAX_SIZE = 64 * 1024;
    let size = 0;

    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_SIZE) {
        reject(new Error('Payload too large'));
        return;
      }
      raw += chunk.toString('utf8');
    });

    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

/**
 * Run standard preflight checks: CORS, method, rate limit, body parse.
 * Returns parsed body on success, or null if the response was already sent.
 */
export async function handleApiPreflight(
  req: IncomingMessage,
  res: ServerResponse,
  requiredMethod = 'POST',
): Promise<unknown> {
  const origin =
    typeof req.headers['origin'] === 'string' ? req.headers['origin'] : '*';
  applySecurityHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end('OK');
    return null;
  }

  if (req.method !== requiredMethod) {
    sendJson(res, 405, { error: `Method ${req.method ?? 'UNKNOWN'} not allowed` });
    return null;
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    sendJson(res, 429, { error: 'Too many requests. Please wait a minute.' });
    return null;
  }

  try {
    const body = await readJsonBody(req);
    return body;
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes('too large')) {
      sendJson(res, 413, { error: 'Payload exceeds 64 KB size limit' });
    } else {
      sendJson(res, 400, { error: 'Invalid JSON request payload' });
    }
    return null;
  }
}
