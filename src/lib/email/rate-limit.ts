// Contact form rate limits and duplicate detection.
// Uses the Vercel-connected Upstash Redis store (KV_REST_API_URL and
// KV_REST_API_TOKEN) when configured, so limits hold across serverless
// instances. Falls back to in-memory limits locally or if Redis fails.
// Keys are SHA-256 hashes under "vietbites:contact:", so no raw IP or email
// is stored. Exports: consumeIp, consumeEmail, consumeBurst, isDuplicate,
// setDuplicate, hasQuotaError.

import { createHash } from "node:crypto";

type ConsumeResult =
    | { ok: true; remaining: number; resetAt: number }
    | { ok: false; remaining: 0; resetAt: number };

const now = () => Date.now();

// ---- Redis (Upstash REST) -------------------------------------------------

function redisConfig() {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    return url && token ? { url, token } : null;
}

async function redis(command: (string | number)[]): Promise<unknown> {
    const config = redisConfig();
    if (!config) throw new Error("Redis is not configured");
    const response = await fetch(config.url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error(`Redis HTTP ${response.status}`);
    const body = (await response.json()) as { result?: unknown; error?: string };
    if (body.error) throw new Error(`Redis error: ${body.error}`);
    return body.result;
}

function redisKey(kind: string, id: string) {
    const hash = createHash("sha256").update(id).digest("hex").slice(0, 32);
    return `vietbites:contact:${kind}:${hash}`;
}

// Atomic fixed window: count this attempt and return [count, ms left].
const consumeScript = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return {count, redis.call('PTTL', KEYS[1])}`;

async function redisConsume(
    key: string,
    windowMs: number,
    max: number,
): Promise<ConsumeResult> {
    const result = (await redis(["EVAL", consumeScript, 1, key, windowMs])) as [
        number,
        number,
    ];
    const [count, ttl] = result;
    const resetAt = now() + Math.max(ttl, 0);
    if (count > max) return { ok: false, remaining: 0, resetAt };
    return { ok: true, remaining: max - count, resetAt };
}

// ---- Memory fallback --------------------------------------------------------

const memCounters = new Map<string, { count: number; resetAt: number }>();
const memDups = new Map<string, number>();

function memConsume(key: string, windowMs: number, max: number): ConsumeResult {
    const n = now();
    const entry = memCounters.get(key);
    if (!entry || n > entry.resetAt) {
        memCounters.set(key, { count: 1, resetAt: n + windowMs });
        return { ok: true, remaining: max - 1, resetAt: n + windowMs };
    }
    if (entry.count >= max)
        return { ok: false, remaining: 0, resetAt: entry.resetAt };
    entry.count += 1;
    return { ok: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

async function consume(
    kind: string,
    id: string,
    windowMs: number,
    max: number,
): Promise<ConsumeResult> {
    if (redisConfig()) {
        try {
            return await redisConsume(redisKey(kind, id), windowMs, max);
        } catch (err) {
            console.warn(`rate-limit: Redis ${kind} check failed, using memory`, err);
        }
    }
    return memConsume(`${kind}:${id}`, windowMs, max);
}

// ---- Public API -------------------------------------------------------------

export function consumeIp(ip: string): Promise<ConsumeResult> {
    return consume("ip", ip, 10 * 60 * 1000, 5);
}

export function consumeEmail(email: string): Promise<ConsumeResult> {
    return consume("email", email.toLowerCase(), 60 * 60 * 1000, 3);
}

export function consumeBurst(
    key: string,
    windowMs: number,
    max: number,
): Promise<ConsumeResult> {
    return consume("burst", key, windowMs, max);
}

export async function isDuplicate(hash: string): Promise<boolean> {
    if (redisConfig()) {
        try {
            return (await redis(["EXISTS", redisKey("duplicate", hash)])) === 1;
        } catch (err) {
            console.warn("rate-limit: Redis duplicate check failed, using memory", err);
        }
    }
    const expires = memDups.get(hash);
    if (!expires) return false;
    if (now() > expires) {
        memDups.delete(hash);
        return false;
    }
    return true;
}

export async function setDuplicate(hash: string, ttlMs: number) {
    if (redisConfig()) {
        try {
            await redis(["SET", redisKey("duplicate", hash), "1", "PX", ttlMs]);
            return;
        } catch (err) {
            console.warn("rate-limit: Redis duplicate write failed, using memory", err);
        }
    }
    memDups.set(hash, now() + ttlMs);
    setTimeout(() => memDups.delete(hash), ttlMs + 1000);
}

export function hasQuotaError(errorCodes: unknown) {
    if (!Array.isArray(errorCodes)) return false;

    return errorCodes
        .map((code) => String(code).toLowerCase())
        .some(
            (code) =>
                code.includes("quota") ||
                code.includes("rate-limit") ||
                code.includes("rate limit"),
        );
}
