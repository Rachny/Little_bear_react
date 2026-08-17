import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: '/Little_bear_react/',
  plugins: [
    tailwindcss(),
    react()
  ],
})