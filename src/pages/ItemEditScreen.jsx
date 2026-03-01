/**
 * ItemEditScreen Component
 * Practical 08: Multi-Screen Navigation with Route Parameters
 * 
 * Demonstrates:
 * - Data passing via URL params (React Router)
 * - Global state updates from detail screen
 * - Navigation with useNavigate hook
 * 
 * Similar to:
 * - Android: Fragment with arguments (Bundle)
 * - Flutter: Navigator.push with arguments
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Leaf, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserContext } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';
import { useHaptics } from '../hooks/useHaptics';
import { Button } from '../components/Shared/Button';
import { Input } from '../components/Shared/Input';
import { Card } from '../components/Shared/Card';
import { CATEGORIES } from '../utils/validation';
import { ToastContainer } from '../components/Shared/Toast';

export const ItemEditScreen = () => {
  // ============================================
  // ROUTE PARAMETERS
  // Similar to: Android arguments.getString("itemId")
  // ============================================
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ============================================
  // GLOBAL STATE ACCESS
  // Similar to: Android ViewModelProvider.get()
  // ============================================
  const { menuItems, updateItem, deleteItem } = useUserContext();
  const { toasts, removeToast, success, error } = useToast();
  const { successPulse, errorPulse } = useHaptics();

  // ============================================
  // LOCAL FORM STATE
  // ============================================
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Main Course',
    isVeg: true,
    isAvailable: true,
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // ============================================
  // LOAD ITEM DATA
  // Find item from global state using route parameter
  // Similar to: Android ViewModel.findItemById(id)
  // ============================================
  useEffect(() => {
    console.log('📝 [ItemEditScreen] Loading item:', itemId);
    console.log('📍 [ItemEditScreen] Navigation state:', location.state);

    // Option 1: Find from global state (preferred)
    const item = menuItems.find((item) => item.id === itemId);

    // Option 2: Use navigation state (if passed)
    const itemFromState = location.state?.item;

    const currentItem = item || itemFromState;

    if (currentItem) {
      console.log('✅ [ItemEditScreen] Item found:', currentItem);
      setFormData({
        name: currentItem.name || '',
        price: currentItem.price?.toString() || '',
        description: currentItem.description || '',
        category: currentItem.category || 'Main Course',
        isVeg: currentItem.isVeg !== undefined ? currentItem.isVeg : true,
        isAvailable: currentItem.isAvailable !== undefined ? currentItem.isAvailable : true,
      });
    } else {
      console.log('❌ [ItemEditScreen] Item not found');
      error('Item not found', 'error');
      navigate('/dashboard/editor');
    }
  }, [itemId, menuItems, location.state, navigate]);

  // ============================================
  // HANDLE FORM CHANGES
  // ============================================
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // ============================================
  // VALIDATE FORM
  // ============================================
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // SAVE CHANGES
  // Updates global state - all screens refresh automatically!
  // Similar to: Android ViewModel.update() with LiveData
  // ============================================
  const handleSave = async () => {
    if (!validate()) {
      errorPulse();
      error('Please fix the errors', 'error');
      return;
    }

    setIsSaving(true);

    try {
      console.log('💾 [ItemEditScreen] Saving changes for item:', itemId);

      const result = await updateItem(itemId, formData);

      if (result.success) {
        successPulse();
        success(`✅ ${formData.name} updated!`, 'success');
        
        // Navigate back after short delay
        setTimeout(() => {
          navigate('/dashboard/editor');
        }, 1000);
      } else {
        errorPulse();
        error(result.error || 'Failed to update item', 'error');
      }
    } catch (err) {
      console.error('❌ [ItemEditScreen] Save error:', err);
      errorPulse();
      error('Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // DELETE ITEM
  // Updates global state - Preview screen auto-refreshes!
  // ============================================
  const handleDelete = async () => {
    if (!confirm(`Delete "${formData.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      console.log('🗑️ [ItemEditScreen] Deleting item:', itemId);
      
      const result = await deleteItem(itemId);

      if (result) {
        successPulse();
        success('Item deleted successfully', 'success');
        navigate('/dashboard/editor');
      } else {
        errorPulse();
        error('Failed to delete item', 'error');
      }
    } catch (err) {
      console.error('❌ [ItemEditScreen] Delete error:', err);
      errorPulse();
      error('Failed to delete item', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-10"
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800">Edit Item</h1>
          <div className="w-16" /> {/* Spacer for center alignment */}
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 space-y-4"
      >
        <Card>
          <div className="p-6 space-y-4">
            {/* Name */}
            <Input
              label="Item Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Masala Dosa"
              error={errors.name}
            />

            {/* Price */}
            <Input
              label="Price (₹)"
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="e.g., 60"
              error={errors.price}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="e.g., Crispy rice crepe with spiced potato filling"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Veg/Non-Veg Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Food Type
              </label>
              <button
                onClick={() => handleChange('isVeg', !formData.isVeg)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.isVeg
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {formData.isVeg ? (
                  <>
                    <Leaf className="w-4 h-4" />
                    Vegetarian
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Non-Veg
                  </>
                )}
              </button>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Availability
              </label>
              <button
                onClick={() => handleChange('isAvailable', !formData.isAvailable)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.isAvailable
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {formData.isAvailable ? 'Available' : 'Unavailable'}
              </button>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>

          <Button
            onClick={handleDelete}
            variant="secondary"
            className="bg-red-50 text-red-600 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

/**
 * DATA PASSING COMPARISON:
 * 
 * 1. REACT ROUTER:
 *    - URL Params: /edit/:itemId → useParams()
 *    - Navigation State: navigate(path, { state: { item } })
 *    - Access: location.state.item
 * 
 * 2. ANDROID NAVIGATION:
 *    - Bundle: arguments.putString("itemId", id)
 *    - Safe Args: NavDirections with type-safe args
 *    - Access: arguments?.getString("itemId")
 * 
 * 3. FLUTTER NAVIGATOR:
 *    - Navigator.push: arguments parameter
 *    - Named routes: Navigator.pushNamed with args
 *    - Access: ModalRoute.of(context)?.settings.arguments
 * 
 * 4. GLOBAL STATE UPDATE FLOW:
 *    React: updateItem() → Context updates → All observers re-render
 *    Android: update() → LiveData.postValue() → Observers notified
 *    Flutter: update() → notifyListeners() → Consumers rebuild
 */
