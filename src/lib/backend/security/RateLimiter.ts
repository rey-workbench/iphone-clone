export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	retryAfterMs: number;
}

export class RateLimiter {
	private rateLimitMap = new Map<string, number[]>();
	private blockedIPs = new Map<string, number>(); // ip -> unblockTimeMs
	private windowMs: number;
	private maxAttempts: number;
	private penaltyMs: number;

	/**
	 * @param windowMs Time window in milliseconds (default: 1 minute)
	 * @param maxAttempts Max attempts within the window (default: 5)
	 * @param penaltyMs Penalty duration if max attempts exceeded (default: 5 minutes)
	 */
	constructor(
		windowMs: number = 60 * 1000,
		maxAttempts: number = 5,
		penaltyMs: number = 5 * 60 * 1000
	) {
		this.windowMs = windowMs;
		this.maxAttempts = maxAttempts;
		this.penaltyMs = penaltyMs;
	}

	checkLimit(ip: string): RateLimitResult {
		const now = Date.now();

		// 1. Check if IP is currently serving a penalty block
		if (this.blockedIPs.has(ip)) {
			const unblockTime = this.blockedIPs.get(ip)!;
			if (now < unblockTime) {
				return { allowed: false, remaining: 0, retryAfterMs: unblockTime - now };
			} else {
				// Penalty is over, release the block
				this.blockedIPs.delete(ip);
				this.rateLimitMap.delete(ip);
			}
		}

		// 2. Filter sliding window
		const attempts = this.rateLimitMap.get(ip) || [];
		const recentAttempts = attempts.filter((timestamp) => now - timestamp < this.windowMs);

		// 3. Apply penalty if threshold exceeded
		if (recentAttempts.length >= this.maxAttempts) {
			const unblockTime = now + this.penaltyMs;
			this.blockedIPs.set(ip, unblockTime);
			return { allowed: false, remaining: 0, retryAfterMs: this.penaltyMs };
		}

		// 4. Log attempt
		recentAttempts.push(now);
		this.rateLimitMap.set(ip, recentAttempts);

		return {
			allowed: true,
			remaining: this.maxAttempts - recentAttempts.length,
			retryAfterMs: 0
		};
	}

	// Clears expired data to prevent memory leaks in production servers
	cleanup() {
		const now = Date.now();

		for (const [ip, unblockTime] of this.blockedIPs.entries()) {
			if (now >= unblockTime) {
				this.blockedIPs.delete(ip);
			}
		}

		for (const [ip, attempts] of this.rateLimitMap.entries()) {
			const recentAttempts = attempts.filter((timestamp) => now - timestamp < this.windowMs);
			if (recentAttempts.length === 0) {
				this.rateLimitMap.delete(ip);
			} else {
				this.rateLimitMap.set(ip, recentAttempts);
			}
		}
	}
}
