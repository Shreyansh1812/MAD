/**
 * MenuPreview Component
 * Real-time preview of the customer-facing menu
 */

import { UtensilsCrossed, Eye, Smartphone } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../Shared/Card';
import { EmptyState } from '../Shared/EmptyState';
import { formatPrice } from '../../utils/validation';

export const MenuPreview = ({ menuItems, vendorName = 'Quick Menu' }) => {
  return (
    <Card className="h-full shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2.5 rounded-xl shadow-md">
            <Eye size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Live Preview</h2>
            <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-1.5">
              <Smartphone size={14} />
              Customer view • Updates in real-time
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="bg-gradient-to-br from-gray-50 to-white">
        {/* Customer Menu Preview */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          {/* Phone Header Simulation */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <UtensilsCrossed size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-center">{vendorName}</h3>
            <p className="text-center text-primary-100 mt-1 font-medium">Digital Menu</p>
          </div>

          <div className="p-6">
            {menuItems.length === 0 ? (
              <EmptyState
                icon={UtensilsCrossed}
                title="Preview your menu"
                description="Items you add will appear here exactly as customers see them"
              />
            ) : (
              <div className="space-y-4">
                {menuItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-lg transition-all duration-300 animate-fade-in"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-white text-lg font-black shadow-md">
                            {index + 1}
                          </span>
                          <h4 className="font-black text-xl text-gray-900 group-hover:text-primary-700 transition-colors">
                            {item.name}
                          </h4>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white px-5 py-3 rounded-xl shadow-md">
                          <p className="text-2xl font-black">
                            ₹{formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {menuItems.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200">
              <p className="text-center text-sm text-gray-600 font-medium">
                Total {menuItems.length} {menuItems.length === 1 ? 'item' : 'items'} available
              </p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
