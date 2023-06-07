import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	publicDir: 'static',
	server: {
		cors: true,
	},
	build: {
		outDir: 'public',
	},
});
