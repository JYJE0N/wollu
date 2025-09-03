import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 프로덕션 빌드에서 ESLint 오류 무시 (경고는 허용)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 프로덕션 빌드에서 TypeScript 오류도 무시 (개발 환경에서만 체크)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
