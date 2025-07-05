import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to WhatsOrder</h1>
        <p className="text-gray-600 mb-6">
          A simple WhatsApp-based order form for small businesses.
        </p>
        <Link
          href="/order"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Create Your Order
        </Link>
      </div>
    </main>
  );
}
