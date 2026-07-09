import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/forest-fire-exam/', // 新增这一行，仓库名前后斜杠不能省略
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
