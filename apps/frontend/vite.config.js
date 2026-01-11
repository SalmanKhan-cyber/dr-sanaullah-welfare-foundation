import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
	// For Cloudflare Pages, we need to use process.env directly
	return {
		plugins: [react()],
		server: { 
			port: 5173,
			host: '0.0.0.0'
		},
		define: {
			// Expose environment variables to the client
			// Use process.env for Cloudflare Pages compatibility
			'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
			'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
			'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
		}
	};
});
