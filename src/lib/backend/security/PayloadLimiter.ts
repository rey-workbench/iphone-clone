export class PayloadLimiter {
	private maxPayloadSize: number;

	constructor(maxPayloadSize: number = 2 * 1024 * 1024) {
		this.maxPayloadSize = maxPayloadSize;
	}

	/**
	 * Validates the Content-Length header against the allowed limit.
	 * Throws an error with status 413 if the payload exceeds the limit.
	 */
	checkSize(contentLengthHeader: string | null): void {
		if (contentLengthHeader) {
			const size = parseInt(contentLengthHeader, 10);
			if (isNaN(size) || size > this.maxPayloadSize) {
				const error = new Error('Payload too large');
				(error as any).status = 413;
				throw error;
			}
		}
	}
}
