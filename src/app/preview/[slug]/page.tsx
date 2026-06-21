// app/preview/[slug]/page.tsx
import { Suspense } from 'react';
import PreviewClient from './PreviewClient';

// Server component - a parent to the client component
export default function PreviewPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewClient />
    </Suspense>
  );
}
