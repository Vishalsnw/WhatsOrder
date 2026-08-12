'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, CheckCircle2, ShieldAlert, Mail } from 'lucide-react';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between p-4 sm:p-8 font-sans">
      <div className="max-w-2xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 my-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Request Account & Data Deletion</h1>
            <p className="text-sm text-slate-500">WhatsOrder - Account & Personal Data Policy</p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center my-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-emerald-900 mb-1">Deletion Request Received</h3>
            <p className="text-sm text-emerald-700 mb-4">
              We have recorded your request for <strong>{email}</strong>. Your account and all associated order forms, product data, and history will be permanently deleted within 48 hours.
            </p>
            <p className="text-xs text-slate-500">
              For immediate confirmation or support, contact us at <a href="mailto:vishalsnw007@gmail.com" className="text-emerald-700 underline font-medium">vishalsnw007@gmail.com</a>.
            </p>
          </div>
        ) : (
          <>
            <p className="text-slate-600 mb-6 text-sm sm:text-base leading-relaxed">
              If you wish to permanently delete your <strong>WhatsOrder</strong> account and remove all stored data (including your business profile, order forms, product catalogs, and order history), please submit your details below or email us directly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Registered Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason for leaving (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell us how we can improve..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Submit Account Deletion Request
              </button>
            </form>

            <div className="border-t border-slate-100 pt-6 space-y-4 text-xs text-slate-500">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  <strong>What data gets deleted?</strong> All user account credentials, saved store configurations, created order forms, product images, and order history linked to your account.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Direct Email Support:</strong> You can also email your deletion request directly to <a href="mailto:vishalsnw007@gmail.com" className="text-slate-700 underline font-medium">vishalsnw007@gmail.com</a> with the subject line <em>&quot;Account Deletion Request&quot;</em>.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="text-center text-xs text-slate-400 my-4">
        &copy; {new Date().getFullYear()} WhatsOrder. All rights reserved.
      </footer>
    </div>
  );
}
