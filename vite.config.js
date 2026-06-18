import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Esta barra es crucial al inicio y al final
  base: '/ProyectoPersonal-Multimedios/',
})
