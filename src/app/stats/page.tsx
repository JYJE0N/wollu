'use client';

import dynamic from 'next/dynamic';

const StatsPage = dynamic(() => import('@/presentation/components/Stats/StatsPage'), { ssr: false });

export default function Stats() {
  return <StatsPage />;
}