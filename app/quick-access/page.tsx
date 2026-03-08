'use client';

import QuickAccessCarousel from '@/components/quick-access-carousel';
import ProtectedRoute from '@/components/protected-route';

export default function QuickAccessPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        <QuickAccessCarousel />
      </div>
    </ProtectedRoute>
  );
}
