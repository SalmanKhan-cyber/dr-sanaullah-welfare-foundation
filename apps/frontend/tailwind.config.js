/**** @type {import('tailwindcss').Config} ****/
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: '#16a34a',
					dark: '#15803d',
					light: '#86efac',
					lighter: '#dcfce7',
				},
			},
		},
	},
	plugins: [],
};
