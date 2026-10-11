import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const rootEnvExists = fs.existsSync(path.resolve(currentDir, '../.env'))
  const localEnvExists = fs.existsSync(path.resolve(currentDir, '.env'))
  const envDir = localEnvExists ? currentDir : (rootEnvExists ? path.resolve(currentDir, '..') : currentDir)
  const env = loadEnv(mode, envDir, '')

  const resolvedBackendUrl =
    process.env.VITE_API_BASE_URL ||
    env.VITE_API_BASE_URL ||
    process.env.BACKEND_URL ||
    env.BACKEND_URL ||
    process.env.API_BASE_URL ||
    env.API_BASE_URL ||
    ''

  return {
    plugins: [react()],
    envDir: localEnvExists ? './' : (rootEnvExists ? '../' : './'),
    define: {
      ...(resolvedBackendUrl
        ? { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(resolvedBackendUrl) }
        : {}),
    },
  }
})
