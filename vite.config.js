import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // host: true → il dev server ascolta su tutte le interfacce di rete,
  // così l'app è raggiungibile dagli altri dispositivi sulla LAN.
  server: {
    host: true,
    port: 5173,
  },
})
