// Lightweight instance-local abuse protection, alongside a honeypot and bounded inputs.
// Entries expire and the map is bounded; this is not a distributed/global quota.
export function createEnquiryLimiter() {
    const attempts = new Map<string, { count: number; until: number }>();
    const windowMs = 10 * 60 * 1000;
    return (keys: string[], now = Date.now()) => {
        for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
        if (attempts.size > 2000) return false;
        if (keys.some(key => (attempts.get(key)?.count ?? 0) >= 5)) return false;
        for (const key of keys) {
            const entry = attempts.get(key) ?? { count: 0, until: now + windowMs };
            entry.count++;
            attempts.set(key, entry);
        }
        return true;
    };
}
