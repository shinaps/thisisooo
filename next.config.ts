import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
    '@libsql/client', // ←必須
    '@libsql/isomorphic-ws', // ←Ws ドライバを使うなら
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  typedRoutes: true,
}

export default nextConfig

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()
