/**
 * MenuViewPage Component
 * Customer-facing menu view (accessed via QR code)
 */

import { UtensilsCrossed, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '../components/Shared/Button';
import { EmptyState } from '../components/Shared/EmptyState';
import { Alert } from '../components/Shared/Alert';
import { formatPrice } from '../utils/validation';

export const MenuViewPage = ({ menuData }) => {
  const menuItems = menuData || [];
  const hasMenu = menuItems && menuItems.length > 0;
  const error = !menuData;

  if (error || !hasMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Alert 
            type="error" 
            title="Menu Not Found" 
            message="This QR code doesn't contain valid menu data. Please scan a valid QuickMenu QR code." 
            className="animate-fade-in"
          />
          <div className="mt-8 text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = window.location.origin}
            >
              <ArrowLeft size={20} className="mr-2" />
              Go to Menu Editor
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500">
      {/* Sticky Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-xl sticky top-0 z-50 border-b-4 border-primary-600">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-4 rounded-3xl shadow-2xl mb-4">
              <UtensilsCrossed className="text-white" size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Quick Menu</h1>
            <p className="text-base text-gray-600 mt-2 font-semibold">Digital Menu • Offline-Enabled</p>
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {menuItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <EmptyState
              icon={UtensilsCrossed}
              title="No items available"
              description="This menu is currently empty. Please check back later!"
            />
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-6 border-2 border-white hover:border-primary-300 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 text-white text-xl font-black flex-shrink-0 shadow-lg">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-black text-gray-900 mb-1 leading-tight">
                        {item.name}
                      </h2>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                      <p className="text-3xl font-black">
                        ₹{formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-white px-8 py-6">
            <p className="text-lg font-bold text-gray-900 mb-2">
              {menuItems.length} {menuItems.length === 1 ? 'Item' : 'Items'} Available
            </p>
            <p className="text-sm text-gray-600 font-medium flex items-center justify-center gap-2">
              <Clock size={16} />
              Updated in real-time
            </p>
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <p className="text-xs text-gray-500 font-semibold">
                Powered by <span className="text-primary-600 font-black">QuickMenu</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
