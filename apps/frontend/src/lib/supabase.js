import { createClient } from '@supabase/supabase-js';

// Temporary fix - hardcoded values for testing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qudebdejubackprbarvc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZGViZGVqdWJhY2twcmJhcnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQxMDEsImV4cCI6MjA3NzM0MDEwMX0.S1Mlr0_RliSCTKIbaMGth4EiVRiUjmxOKwRYu6vQQ1Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true
	}
});
