import PreviewClient from './PreviewClient';

// Generate static params for export
export async function generateStaticParams() {
  // Return empty array since we handle dynamic routing client-side
  // This allows the route to exist but be populated dynamically
  return [];
}

// Server component that passes params to client component
export default function PreviewOrderPage({ params }: { params: Promise<{ slug: string }> }) {
  return <PreviewClient params={params} />;
}