import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
	console.warn('Supabase URL or Service Role Key missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
	auth: { persistSession: false }
});

export function getSupabaseForToken(token) {
	return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY, {
		auth: { persistSession: false, detectSessionInUrl: false },
		global: { headers: { Authorization: `Bearer ${token}` } }
	});
}
