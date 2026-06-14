import { supabase } from '$lib/config/supabase';

export class KeepaliveRepository {
	async ping() {
		const { error: upsertError } = await supabase
			.from('temp')
			.upsert([{ id: 1, note: 'keepalive ping', pinged_at: new Date().toISOString() }]);

		if (upsertError) {
			throw new Error(upsertError.message);
		}
	}
}
