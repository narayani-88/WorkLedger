import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/api/auth': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            },
            '/api/users': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            },
            '/api/tenants': {
                target: 'http://localhost:8082',
                changeOrigin: true,
            },
            '/api/services': {
                target: 'http://localhost:8083',
                changeOrigin: true,
            },
            '/api/employees': {
                target: 'http://localhost:8083',
                changeOrigin: true,
            },
            '/api/projects': {
                target: 'http://localhost:8083',
                changeOrigin: true,
            },
            '/api/tasks': {
                target: 'http://localhost:8083',
                changeOrigin: true,
            },
            '/api/timelogs': {
                target: 'http://localhost:8083',
                changeOrigin: true,
            }
        }
    }
})
