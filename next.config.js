/** @type {import('next').NextConfig} */

const nextConfig = {
  // Production optimizasyonları
  productionBrowserSourceMaps: false, // Production'da source map'leri devre dışı bırak
  poweredByHeader: false, // X-Powered-By header'ını kaldır
  compress: true, // Gzip sıkıştırmayı etkinleştir
  
  // ESLint'i geçici olarak devre dışı bırak
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript kontrolünü geçici olarak devre dışı bırak
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimizasyonu
  images: {
    domains: ['localhost', 'your-domain.com', '82.29.178.196'], // Production'da kullanılacak domain'leri ekle
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // Webpack optimizasyonları
  webpack: (config, { dev, isServer }) => {
    // Production'da bundle size optimizasyonu
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },

  // Environment değişkenleri
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Experimental özellikler
  experimental: {
    optimizeCss: true, // CSS optimizasyonu
    scrollRestoration: true, // Scroll pozisyonunu koruma
  },
};

module.exports = nextConfig; 