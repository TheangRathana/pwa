declare module 'next-pwa' {
    import { NextConfig } from 'next'
    
    interface PWAConfig {
      dest?: string
      disable?: boolean
      register?: boolean
      skipWaiting?: boolean
      runtimeCaching?: Array<{
        urlPattern: RegExp | string
        handler: string
        options?: {
          cacheName?: string
          expiration?: {
            maxEntries?: number
            maxAgeSeconds?: number
          }
          networkTimeoutSeconds?: number
          backgroundSync?: {
            name: string
            options?: {
              maxRetentionTime?: number
            }
          }
        }
      }>
    }
  
    function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig
    export = withPWA
  }