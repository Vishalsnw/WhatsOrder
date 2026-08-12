'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 my-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-sm text-slate-500">WhatsOrder - Transparency & Data Protection</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">1. Overview</h2>
            <p>
              WhatsOrder (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides a web and mobile platform enabling small businesses to create digital order forms and receive orders on WhatsApp. We respect your privacy and are committed to protecting the personal data you share with us.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> Email address and password for account creation and login.</li>
              <li><strong>Business & Store Data:</strong> Business name, WhatsApp phone number, currency preferences, product names, descriptions, prices, and catalog images.</li>
              <li><strong>Customer Order Details:</strong> Customer name, delivery address, phone number, and selected items processed for WhatsApp order completion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">3. How We Use Information</h2>
            <p>
              Your data is solely used to provide app functionality, manage your store catalog, record customer orders, and enable smooth checkout experiences on WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">4. Data Deletion & Account Erasure</h2>
            <p>
              You have the right to request deletion of your account and associated data at any time. You can use our dedicated <Link href="/delete-account" className="text-emerald-600 underline font-medium">Account Deletion Request Page</Link> or email us at <a href="mailto:vishalsnw007@gmail.com" className="text-emerald-600 underline font-medium">vishalsnw007@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:vishalsnw007@gmail.com" className="text-emerald-600 underline font-medium">vishalsnw007@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 my-4">
        &copy; {new Date().getFullYear()} WhatsOrder. All rights reserved.
      </footer>
    </div>
  );
}
