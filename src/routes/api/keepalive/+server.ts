import { supabase } from '$lib/config/supabase';
import { apiHandler, ApiError } from '$lib/server/api';

export function GET() {
    return apiHandler(async () => {
        const { error: upsertError } = await supabase
            .from('temp')
            .upsert([{ id: 1, note: 'keepalive ping', pinged_at: new Date().toISOString() }]);
        
        if (upsertError) {
            console.error('Keepalive upsert error:', upsertError);
            throw new ApiError(500, upsertError.message);
        }

        return { timestamp: new Date().toISOString(), status: 'Database is alive & cleaned' };
    });
}
