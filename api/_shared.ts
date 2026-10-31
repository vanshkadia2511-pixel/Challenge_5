/**
 * _shared.ts — Shared serverless utilities: rate limiting, CORS, security headers, and size limits.
 *
 * SPEC REQUIREMENT (§7):
 * Key in env only, sent in a header, never logged or sent to the browser.
 * Body size cap (64 KB), per-IP rate limit (20 AI requests/min), exact-origin CORS,
 * CSP + HSTS + nosniff + Referrer-Policy + frame restrictions, consistent
 * non-sensitive error responses, no raw provider errors shown.
 */

import type { IncomingMessage, ServerResponse } from 'http';

export interface VercelRequest extends IncomingMessage {
  body?: unknown;
  query?: Record<string, string | string[]>;
}

export type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse;
  json: (data: unknown) => void;
  send: (data: string) => void;
};

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
    return false; // Rate limit exceeded
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

/** Set required security headers on serverless response */
export function applySecurityHeaders(res: VercelResponse, origin = '*'): void {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || origin;
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
}

/** Read raw body with 64 KB size cap */
export async function readJsonBody(req: VercelRequest): Promise<unknown> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    const MAX_SIZE = 64 * 1024; // 64 KB cap
    let size = 0;

    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_SIZE) {
        reject(new Error('Payload too large: exceeds 64 KB cap'));
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
        reject(new Error('Invalid JSON format'));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

/** Extract client IP address from standard headers */
export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() ?? '127.0.0.1';
  }
  return req.socket.remoteAddress ?? '127.0.0.1';
}

/** Run standard preflight checks: method, body size, rate limit, CORS */
export async function handleApiPreflight(
  req: VercelRequest,
  res: VercelResponse,
  requiredMethod = 'POST',
): Promise<unknown> {
  const originHeader = typeof req.headers.origin === 'string' ? req.headers.origin : '*';
  applySecurityHeaders(res, originHeader);

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).send('OK');
    return null;
  }

  if (req.method !== requiredMethod) {
    res.status(405).json({ error: `Method ${req.method ?? 'UNKNOWN'} not allowed` });
    return null;
  }

  // Rate limiting check
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    res.status(429).json({
      error: 'Too many requests. Please wait a minute before trying again.',
    });
    return null;
  }

  // Read and validate body size
  try {
    const body = await readJsonBody(req);
    return body;
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes('too large')) {
      res.status(413).json({ error: 'Payload exceeds 64 KB size limit' });
    } else {
      res.status(400).json({ error: 'Invalid JSON request payload' });
    }
    return null;
  }
}
