/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 패키지 임포트 최적화 - 번들 크기 감소
    optimizePackageImports: [
      'framer-motion',
      'recharts', 
      'react-icons',
      'lucide-react'
    ]
  },
  
  // 웹팩 최적화
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 프로덕션 빌드에서만 최적화 적용
    if (!dev && !isServer) {
      // 청크 분할 최적화
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Recharts 라이브러리를 별도 청크로 분리
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            chunks: 'all',
            priority: 10,
          },
          // React Icons를 별도 청크로 분리
          reactIcons: {
            name: 'react-icons',
            test: /[\\/]node_modules[\\/]react-icons[\\/]/,
            chunks: 'all',
            priority: 9,
          },
          // 기타 vendor 라이브러리들
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 1,
            minChunks: 2,
          },
        },
      }
    }

    return config
  },

  // 트레일링 슬래시 제거 (성능 개선)
  trailingSlash: false,

  // 압축 활성화
  compress: true,

  // 이미지 최적화 설정 (필요시)
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // 도메인 리디렉션 (Railway 등록 도메인)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'wollu.app',
          },
        ],
        destination: 'https://wollu.life/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.wollu.life',
          },
        ],
        destination: 'https://wollu.life/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.wollu.app',
          },
        ],
        destination: 'https://wollu.life/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'wollu.site',
          },
        ],
        destination: 'https://wollu.life/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.wollu.site',
          },
        ],
        destination: 'https://wollu.life/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig