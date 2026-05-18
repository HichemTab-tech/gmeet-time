import {crx} from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import manifest from './manifest.config'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), crx({manifest})],
})
