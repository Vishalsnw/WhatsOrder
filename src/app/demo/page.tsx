'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      title: "Sign Up / Login",
      content: "Start by creating an account or logging in anonymously",
      icon: "🔐"
    },
    {
      title: "Create Your First Form",
      content: "Click 'Create Form' and enter your business details",
      icon: "✨"
    },
    {
      title: "Add Products",
      content: "Add your products with names, prices, and images",
      icon: "🛍️"
    },
    {
      title: "Customize & Preview",
      content: "Preview your form and make adjustments",
      icon: "👀"
    },
    {
      title: "Share & Collect Orders",
      content: "Share your form link and start receiving orders via WhatsApp",
      icon: "📱"
    },
    {
      title: "Track Analytics",
      content: "Monitor your form performance and order statistics",
      icon: "📊"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 WhatsOrder Demo
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Complete guide to creating your first order form
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
            <Link href="/dashboard" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Steps Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Quick Overview</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  currentStep === index + 1 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCurrentStep(index + 1)}
              >
                <div className="text-2xl mb-2">{step.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 Detailed Instructions</h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🔐 Step 1: Sign Up / Login</h3>
              <div className="space-y-2 text-gray-700">
                <p>• Click on "Get Started" or visit the login page</p>
                <p>• Choose "Continue as Guest" for anonymous login</p>
                <p>• Set your display name when prompted</p>
                <p>• You'll be redirected to your dashboard</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">✨ Step 2: Create Your First Form</h3>
              <div className="space-y-2 text-gray-700">
                <p>• Click "Create Form" from dashboard or sidebar</p>
                <p>• Choose "Start from Scratch" or select a template</p>
                <p>• Enter your business name</p>
                <p>• Add your WhatsApp number (with country code)</p>
                <p>• Choose a unique form URL slug</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🛍️ Step 3: Add Products</h3>
              <div className="space-y-2 text-gray-700">
                <p>• Click "Add Product" to create your first item</p>
                <p>• Enter product name and price</p>
                <p>• Upload product image (optional but recommended)</p>
                <p>• Add product description</p>
                <p>• Repeat for all your products</p>
                <p>• Use drag & drop to reorder products</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border-l-4 border-yellow-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">👀 Step 4: Customize & Preview</h3>
              <div className="space-y-2 text-gray-700">
                <p>• Click "Preview Form" to see how it looks</p>
                <p>• Test the ordering process</p>
                <p>• Make adjustments to products or styling</p>
                <p>• Check mobile responsiveness</p>
                <p>• Ensure WhatsApp integration works</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="border-l-4 border-red-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📱 Step 5: Share & Collect Orders</h3>
              <div className="space-y-2 text-gray-700">
                <p>• Copy your form URL from the preview page</p>
                <p>• Share on social media, website, or business cards</p>
                <p>• Generate QR code for easy mobile access</p>
                <p>• Customers fill the form and send orders via WhatsApp</p>
                <p>• Receive formatted orders directly in WhatsApp</p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="border-l-4 border-indigo-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📊 Step 6: Track Analytics</h3>
              <div className="space-y-2 text-gray-700">
                <p>• Visit the Analytics page to see form performance</p>
                <p>• Track total views and conversion rates</p>
                <p>• Monitor popular products</p>
                <p>• View recent orders and trends</p>
                <p>• Export data for further analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Professional Design</h4>
                  <p className="text-gray-600">Material Design inspired interface that looks great on all devices</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h4 className="font-semibold text-gray-900">WhatsApp Integration</h4>
                  <p className="text-gray-600">Orders sent directly to your WhatsApp with formatted messages</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Real-time Updates</h4>
                  <p className="text-gray-600">Instant updates to your forms and analytics</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Fast & Responsive</h4>
                  <p className="text-gray-600">Lightning fast loading and mobile-optimized design</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Secure & Anonymous</h4>
                  <p className="text-gray-600">Anonymous authentication option for quick setup</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Analytics Dashboard</h4>
                  <p className="text-gray-600">Track performance with detailed analytics and insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">💡 Pro Tips</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p>• Use high-quality product images to increase conversion</p>
              <p>• Keep product names clear and descriptive</p>
              <p>• Test your form on mobile before sharing</p>
            </div>
            <div className="space-y-3">
              <p>• Share QR codes for easy mobile access</p>
              <p>• Monitor analytics to optimize performance</p>
              <p>• Update products regularly to keep content fresh</p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
          <div className="flex justify-center space-x-4">
            <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create Your First Form
            </Link>
            <Link href="/dashboard" className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}