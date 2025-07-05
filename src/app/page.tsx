import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🛍️ WhatsOrder — Take WhatsApp Orders Easily
        </h1>
        <p className="text-gray-600 mb-6">
          Accept product orders from your customers directly on WhatsApp. No coding, no setup — just
          share your link and start receiving orders!
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/order?phone=919975859935"
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
          >
            Try Order Form
          </Link>
          <Link
            href="https://wa.me/919999888877"
            target="_blank"
            className="border border-green-600 text-green-600 px-6 py-3 rounded hover:bg-green-50 transition"
          >
            Contact on WhatsApp
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Built with 💚 for small businesses. Powered by Next.js & Vercel.
        </p>
      </div>
    </main>
  );
}
