import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
	// For Cloudflare Pages, use hardcoded values as fallback
	const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qudebdejubackprbarvc.supabase.co';
	const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1ZGViZGVqdWJhY2twcmJhcnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQxMDEsImV4cCI6MjA3NzM0MDEwMX0.S1Mlr0_RliSCTKIbaMGth4EiVRiUjmxOKwRYu6vQQ1Y';
	const apiUrl = process.env.VITE_API_URL || 'https://api.drsanaullahwelfarefoundation.com';

	return {
		plugins: [react()],
		server: { 
			port: 5173,
			host: '0.0.0.0'
		},
		define: {
			// Expose environment variables to client
			'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
			'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
			'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
			// Also define process.env for fallback
			'process.env.VITE_API_URL': JSON.stringify(apiUrl),
		},
		// Add proxy for development
		server: {
			port: 5173,
			host: '0.0.0.0',
			proxy: {
				'/api': {
					target: apiUrl,
					changeOrigin: true,
					secure: true
				}
			}
		}
	};
});
