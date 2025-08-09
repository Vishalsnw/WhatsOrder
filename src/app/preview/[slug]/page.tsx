// app/preview/[slug]/page.tsx
import { Suspense } from 'react';
import PreviewClient from './PreviewClient';

// Build time pe slugs generate karo
export async function generateStaticParams() {
  // Yahan API, DB ya file se slugs fetch karo
  const slugs = ["product-1", "product-2", "product-3"];

  return slugs.map((slug) => ({ slug }));
}

// Server component
export default function PreviewPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewClient slug={params.slug} />
    </Suspense>
  );
    }
