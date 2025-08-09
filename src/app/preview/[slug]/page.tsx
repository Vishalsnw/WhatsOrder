import PreviewClient from './PreviewClient';

// Server component that passes params to client component
export default function PreviewOrderPage({ params }: { params: Promise<{ slug: string }> }) {
  return <PreviewClient params={params} />;
}