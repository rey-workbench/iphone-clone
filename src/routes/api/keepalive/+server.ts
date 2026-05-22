import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET() {
    try {
        // Ping database: insert a temp row
        const { error: insertError } = await supabase
            .from('temp')
            .insert([{ note: 'keepalive ping', pinged_at: new Date().toISOString() }]);
        
        if (insertError) {
            console.error('Keepalive insert error:', insertError);
            return json({ success: false, error: insertError.message }, { status: 500 });
        }

        // Cleanup old pings (Optional, but good to avoid infinite growth)
        // E.g. delete records older than 1 day
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        await supabase.from('temp').delete().lt('pinged_at', oneDayAgo);

        return json({ success: true, timestamp: new Date().toISOString() });
    } catch (e: any) {
        return json({ success: false, error: e.message }, { status: 500 });
    }
}
