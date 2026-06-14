type IntentHandler = (payload: any) => Promise<any> | any;
type IntentSubscriber = (payload: any) => void;

export class IntentManager {
	// For 1-to-1 IPC that expects a return value (e.g. data fetching)
	private handlers = new Map<string, IntentHandler>();
	// For 1-to-many event broadcasts
	private subscribers = new Map<string, Set<IntentSubscriber>>();

	// --- 1-to-1 Handlers ---
	register(action: string, handler: IntentHandler) {
		if (this.handlers.has(action)) {
			console.warn(`Intent handler for ${action} is being overwritten.`);
		}
		this.handlers.set(action, handler);
	}

	unregister(action: string) {
		this.handlers.delete(action);
	}

	async send(action: string, payload?: any): Promise<any> {
		// Trigger all subscribers (broadcast) asynchronously without blocking
		const subs = this.subscribers.get(action);
		if (subs) {
			for (const sub of subs) {
				try {
					sub(payload);
				} catch (e) {
					console.error(`Error in intent subscriber for ${action}:`, e);
				}
			}
		}

		// Trigger the main handler if one exists
		const handler = this.handlers.get(action);
		if (handler) {
			return await handler(payload);
		}

		return null;
	}

	// --- 1-to-Many Subscribers ---
	subscribe(action: string, subscriber: IntentSubscriber) {
		if (!this.subscribers.has(action)) {
			this.subscribers.set(action, new Set());
		}
		this.subscribers.get(action)!.add(subscriber);

		// Return unsubscribe function
		return () => {
			const subs = this.subscribers.get(action);
			if (subs) {
				subs.delete(subscriber);
				if (subs.size === 0) this.subscribers.delete(action);
			}
		};
	}
}

export const intentManager = new IntentManager();
