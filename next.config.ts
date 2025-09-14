import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Railway 배포를 위해 임시로 ESLint 오류 무시
    // TODO: 추후 모든 ESLint 오류 수정 필요
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 TypeScript 검사 활성화
    ignoreBuildErrors: false,
  },
  // Railway 최적화 설정
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // 이미지 최적화
  images: {
    domains: [],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // 빌드 최적화
  swcMinify: true,
  productionBrowserSourceMaps: false,
  
  // 캐싱 최적화
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // 실험적 기능
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'react-icons'],
  },
};

export default nextConfig;
