'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, Play, Brain, HelpCircle, BarChart3 } from 'lucide-react';
import CardCarousel from './card-carousel';

export default function QuickAccessCarousel() {
  const router = useRouter();

  const quickAccessItems = [
    {
      id: 'library',
      title: 'Library',
      subtitle: 'Study materials',
      icon: <BookOpen className="w-12 h-12" />,
      onClick: () => router.push('/grade/6'),
    },
    {
      id: 'lectures',
      title: 'Lectures',
      subtitle: 'Video lessons',
      icon: <Play className="w-12 h-12" />,
      onClick: () => router.push('/grade/6/mathematics'),
    },
    {
      id: 'ai-tutor',
      title: 'AI Tutor',
      subtitle: 'Smart learning',
      icon: <Brain className="w-12 h-12" />,
      onClick: () => router.push('/app/smart-calculator'),
    },
    {
      id: 'quiz',
      title: 'Quiz',
      subtitle: 'Test yourself',
      icon: <HelpCircle className="w-12 h-12" />,
      onClick: () => router.push('/quiz'),
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Track progress',
      icon: <BarChart3 className="w-12 h-12" />,
      onClick: () => router.push('/dashboard'),
    },
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Quick Access</h2>
        <p className="text-gray-400">Jump straight to what you need</p>
      </div>
      <CardCarousel items={quickAccessItems} />
    </div>
  );
}
