import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(() => {
  const rootEnvExists = fs.existsSync(path.resolve(currentDir, '../.env'))
  const localEnvExists = fs.existsSync(path.resolve(currentDir, '.env'))

  return {
    plugins: [react()],
    envDir: localEnvExists ? './' : (rootEnvExists ? '../' : './'),
  }
})
