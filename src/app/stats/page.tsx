import type { Metadata } from 'next';
import { Layout } from "@/components/ui/Layout";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { StatsPage } from "@/components/stats/StatsPage";

export const metadata: Metadata = {
  title: '통계 | 월루타자기',
  description: '타이핑 실력 통계와 개선 분석을 확인하세요. 개인 기록 추이, 약점 분석, 맞춤형 연습 추천을 제공합니다.',
  openGraph: {
    title: '통계 | 월루타자기',
    description: '타이핑 실력 통계와 개선 분석을 확인하세요.',
    url: 'https://wollu.life/stats',
  },
};

export default function Page() {
  return (
    <>
      <ThemeInitializer />
      <Layout>
        <StatsPage />
      </Layout>
    </>
  );
}