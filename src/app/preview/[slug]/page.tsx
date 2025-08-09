import PreviewClient from './PreviewClient';

// Generate static params for build time
export async function generateStaticParams() {
  // For static export, we'll generate some common slugs
  // The actual dynamic forms will be handled at runtime
  const commonSlugs = [
    'demo',
    'sample',
    'test',
    'example',
    'store',
    'shop',
    'menu',
    'order'
  ];

  return commonSlugs.map(slug => ({
    slug
  }));
}

// Server component that passes params to client component
export default function PreviewOrderPage({ params }: { params: { slug: string } }) {
  return <PreviewClient params={params} />;
}