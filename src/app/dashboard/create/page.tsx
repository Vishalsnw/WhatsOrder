
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OrderFormEditor from '@/components/forms/OrderFormEditor';

export default function CreateFormPage() {
  const router = useRouter();
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = [
    {
      id: 'restaurant',
      name: 'Restaurant Menu',
      description: 'Perfect for restaurants and food delivery',
      icon: '🍽️',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'retail',
      name: 'Retail Store',
      description: 'Great for clothing and retail businesses',
      icon: '👕',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'services',
      name: 'Service Business',
      description: 'Ideal for service-based businesses',
      icon: '🔧',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'custom',
      name: 'Start from Scratch',
      description: 'Build your own custom form',
      icon: '✨',
      color: 'from-gray-600 to-gray-700'
    }
  ];

  const handleTemplateSelect = (templateId: string) => {
    setShowTemplates(false);
    // Navigate to form editor with template
    router.push(`/dashboard/forms/new?template=${templateId}`);teId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="material-card p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="material-headline5 text-white">Create New Form</h1>
              <p className="material-subtitle1 text-green-100">
                Start building your order form
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
        </div>

        {/* Quick Start Options */}
        <div className="space-y-4">
          <h2 className="material-headline6 text-gray-900">Quick Start</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setShowTemplates(true)}
              className="material-card p-6 text-left hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="flex-1">
                  <h3 className="material-subtitle1 text-gray-900">Use Template</h3>
                  <p className="material-body2 text-gray-600">Start with a pre-built template</p>
                </div>
                <span className="material-icon text-gray-400">→</span>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/forms/new')}
              className="material-card p-6 text-left hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="flex-1">
                  <h3 className="material-subtitle1 text-gray-900">Start from Scratch</h3>
                  <p className="material-body2 text-gray-600">Build a completely custom form</p>
                </div>
                <span className="material-icon text-gray-400">→</span>
              </div>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="material-card p-6">
          <h3 className="material-headline6 text-gray-900 mb-4">What you can create</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm">📱</span>
              </div>
              <div>
                <p className="material-subtitle2 text-gray-900">Mobile-Optimized Forms</p>
                <p className="material-body2 text-gray-600">Beautiful forms that work perfectly on all devices</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm">💬</span>
              </div>
              <div>
                <p className="material-subtitle2 text-gray-900">WhatsApp Integration</p>
                <p className="material-body2 text-gray-600">Orders sent directly to your WhatsApp</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm">🎨</span>
              </div>
              <div>
                <p className="material-subtitle2 text-gray-900">Custom Branding</p>
                <p className="material-body2 text-gray-600">Add your logo, colors, and branding</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm">📊</span>
              </div>
              <div>
                <p className="material-subtitle2 text-gray-900">Real-time Analytics</p>
                <p className="material-body2 text-gray-600">Track views, clicks, and conversions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Modal */}
        {showTemplates && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setShowTemplates(false)}
            />
            <div className="fixed inset-x-4 top-20 bottom-20 z-50 material-card p-6 overflow-y-auto animate-slide-in-bottom">
              <div className="flex items-center justify-between mb-6">
                <h3 className="material-headline5 text-gray-900">Choose Template</h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <span className="material-icon">✕</span>
                </button>
              </div>

              <div className="space-y-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="w-full material-card p-4 text-left hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${template.color} rounded-full flex items-center justify-center`}>
                        <span className="text-2xl">{template.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="material-subtitle1 text-gray-900">{template.name}</h4>
                        <p className="material-body2 text-gray-600">{template.description}</p>
                      </div>
                      <span className="material-icon text-gray-400">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
