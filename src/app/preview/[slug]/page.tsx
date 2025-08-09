

import { Suspense } from 'react';
import PreviewClient from './PreviewClient';

// Generate static params for static export
export async function generateStaticParams() {
  return [];
}

// Server component that renders the client component
export default function PreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewClient />
    </Suspense>
  );
}

