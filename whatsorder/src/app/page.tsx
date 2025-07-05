export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          🛍️ WhatsOrder — Take WhatsApp Orders Easily
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Accept product orders from your customers directly on WhatsApp. No coding, no setup — just share your link and start receiving orders!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/order"
            className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
          >
            Try Order Form
          </a>
          <a
            href="https://wa.me/yourwhatsappnumber"
            target="_blank"
            className="inline-block px-6 py-3 border border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition"
          >
            Contact on WhatsApp
          </a>
        </div>

        <div className="mt-10 text-gray-400 text-sm">
          Built with 💚 for small businesses. Powered by Next.js & Vercel.
        </div>
      </div>
    </main>
  );
}
