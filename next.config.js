/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // 한글 IME 지원을 위한 설정
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
    };
    return config;
  },
  // 한글 폰트 최적화
  optimizeFonts: true,
  // 정적 최적화 활성화
  output: 'standalone',
  // 성능 최적화
  poweredByHeader: false,
  compress: true,
  // 타자연습 특화 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;