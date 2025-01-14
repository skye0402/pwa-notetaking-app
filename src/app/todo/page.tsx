'use client';

import { Suspense } from 'react';
import { Loading } from '@/components/ui/Loading';

export default function Todo() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Todo List</h1>
      <Suspense fallback={<Loading />}>
        <div className="space-y-4">
          {/* Todo list will be implemented later */}
          <p>Coming soon...</p>
        </div>
      </Suspense>
    </div>
  );
}
