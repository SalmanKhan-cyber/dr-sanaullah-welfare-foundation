import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
	// For Cloudflare Pages, use process.env directly
	return {
		plugins: [react()],
		server: { 
			port: 5173,
			host: '0.0.0.0'
		},
		define: {
			// Expose environment variables to the client
			'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
			'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
			'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
		}
	};
});
