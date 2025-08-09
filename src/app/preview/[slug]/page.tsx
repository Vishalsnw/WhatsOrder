
'use client';

import { Suspense } from 'react';
import PreviewClient from './PreviewClient';

// This allows the route to work with static export
export default function PreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewClient />
    </Suspense>
  );
}
