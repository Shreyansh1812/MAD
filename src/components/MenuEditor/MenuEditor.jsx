/**
 * MenuEditor Component
 * Interface for adding and managing menu items
 */

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, UtensilsCrossed, Sparkles, Power, PowerOff, Leaf } from 'lucide-react';
import { Button } from '../Shared/Button';
import { Input } from '../Shared/Input';
import { Card, CardHeader, CardBody } from '../Shared/Card';
import { EmptyState } from '../Shared/EmptyState';
import { formatPrice, CATEGORIES } from '../../utils/validation';
import { useHaptics } from '../../hooks/useHaptics';

export const MenuEditor = ({ menuItems, onAdd, onUpdate, onDelete, onToast }) => {
  const { successPulse, errorPulse } = useHaptics();
  
  const [newItem, setNewItem] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    category: 'Main Course',
    isVeg: true,
    isAvailable: true
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    category: 'Main Course',
    isVeg: true,
    isAvailable: true
  });
  const [errors, setErrors] = useState({ name: '', price: '', description: '', category: '' });
  const [highlightedId, setHighlightedId] = useState(null);

  /**
   * Handle adding new item (Firebase async version)
   */
  const handleAdd = async () => {
    try {
      const result = await onAdd(newItem);
      
      if (result.success) {
        successPulse(); // Haptic feedback on success
        setNewItem({ 
          name: '', 
          price: '', 
          description: '', 
          category: 'Main Course',
          isVeg: true,
          isAvailable: true
        });
        onToast?.(`✨ ${result.item.name} added to menu!`, 'success');
        
        // Highlight new item
        setHighlightedId(result.item.id);
        setTimeout(() => setHighlightedId(null), 2000);
      } else {
        errorPulse(); // Haptic feedback on error
        const errorMsg = result.error || 'Failed to add item';
        setErrors(prev => ({
          ...prev,
          [errorMsg.includes('name') ? 'name' : errorMsg.includes('price') ? 'price' : errorMsg.includes('description') ? 'description' : 'category']: errorMsg,
        }));
        onToast?.(errorMsg, 'error');
      }
    } catch (error) {
      errorPulse();
      console.error('Error adding item:', error);
      onToast?.('Failed to add item: ' + error.message, 'error');
    }
  };

  /**
   * Handle starting edit mode
   */
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditData({ 
      name: item.name, 
      price: item.price.toString(),
      description: item.description || '',
      category: item.category || 'Main Course',
      isVeg: item.isVeg !== undefined ? item.isVeg : true,
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
    });
    setErrors({ name: '', price: '', description: '', category: '' });
  };

  /**
   * Handle saving edit (Firebase async version)
   */
  const saveEdit = async () => {
    try {
      const result = await onUpdate(editingId, editData);
      
      if (result.success) {
        successPulse(); // Haptic feedback on success
        setEditingId(null);
        setEditData({ name: '', price: '', description: '', category: 'Main Course', isVeg: true, isAvailable: true });
        setErrors({ name: '', price: '', description: '', category: '' });
        onToast?.('Item updated successfully!', 'success');
        
        // Highlight updated item
        setHighlightedId(editingId);
        setTimeout(() => setHighlightedId(null), 2000);
      } else {
        errorPulse(); // Haptic feedback on error
        const errorMsg = result.error || 'Failed to update item';
        setErrors(prev => ({
          ...prev,
          [errorMsg.includes('name') ? 'name' : errorMsg.includes('price') ? 'price' : errorMsg.includes('description') ? 'description' : 'category']: errorMsg,
        }));
        onToast?.(errorMsg, 'error');
      }
    } catch (error) {
      errorPulse();
      console.error('Error updating item:', error);
      onToast?.('Failed to update item: ' + error.message, 'error');
    }
  };

  /**
   * Handle canceling edit
   */
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', price: '', description: '', category: 'Main Course', isVeg: true, isAvailable: true });
    setErrors({ name: '', price: '', description: '', category: '' });
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = (id, name) => {
    if (window.confirm(`Remove ${name} from your menu?`)) {
      onDelete(id);
      onToast?.(`${name} removed from menu`, 'info');
    }
  };

  /**
   * Toggle availability
   */
  const toggleAvailability = (item) => {
    const result = onUpdate(item.id, { isAvailable: !item.isAvailable });
    if (result.success) {
      onToast?.(`${item.name} marked as ${!item.isAvailable ? 'available' : 'sold out'}`, 'info');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50 border-b-2 border-primary-100">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2.5 rounded-xl shadow-md">
            <UtensilsCrossed size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Menu Editor</h2>
            <p className="text-sm text-gray-600 mt-0.5">Add and manage your items</p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="space-y-6">
        {/* Add New Item Form */}
        <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl border-2 border-primary-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-primary-600" />
            <h3 className="text-lg font-bold text-gray-900">Add New Item</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Item Name"
              placeholder="e.g., Masala Dosa, Cold Coffee..."
              value={newItem.name}
              onChange={(e) => {
                setNewItem({ ...newItem, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              error={errors.name}
              required
            />
            
            <Input
              label="Description (Optional)"
              placeholder="Brief description..."
              value={newItem.description}
              onChange={(e) => {
                setNewItem({ ...newItem, description: e.target.value });
                setErrors({ ...errors, description: '' });
              }}
              error={errors.description}
              maxLength={100}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (₹)"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={newItem.price}
                onChange={(e) => {
                  setNewItem({ ...newItem, price: e.target.value });
                  setErrors({ ...errors, price: '' });
                }}
                error={errors.price}
                required
              />
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all text-gray-900 font-medium"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItem.isVeg}
                  onChange={(e) => setNewItem({ ...newItem, isVeg: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <Leaf size={18} className="text-green-600" />
                <span className="text-sm font-semibold text-gray-700">Vegetarian</span>
              </label>
            </div>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full shadow-lg hover:shadow-xl mt-4"
            onClick={handleAdd}
          >
            <Plus size={20} />
            Add to Menu
          </Button>
        </div>

        {/* Menu Items List */}
        {menuItems.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No menu items yet"
            description="Add your first delicious item above to get started!"
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Current Menu
              </h3>
              <span className="bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                {menuItems.length} {menuItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  highlightedId === item.id
                    ? 'bg-green-50 border-green-400 shadow-lg scale-105'
                    : item.isAvailable === false
                    ? 'bg-gray-50 border-gray-300 opacity-75'
                    : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-md'
                }`}
              >
                {editingId === item.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <Input
                      label="Name"
                      value={editData.name}
                      onChange={(e) => {
                        setEditData({ ...editData, name: e.target.value });
                        setErrors({ ...errors, name: '' });
                      }}
                      error={errors.name}
                    />
                    <Input
                      label="Description"
                      value={editData.description}
                      onChange={(e) => {
                        setEditData({ ...editData, description: e.target.value });
                        setErrors({ ...errors, description: '' });
                      }}
                      error={errors.description}
                      maxLength={100}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editData.price}
                        onChange={(e) => {
                          setEditData({ ...editData, price: e.target.value });
                          setErrors({ ...errors, price: '' });
                        }}
                        error={errors.price}
                      />
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all text-gray-900 font-medium"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.isVeg}
                        onChange={(e) => setEditData({ ...editData, isVeg: e.target.checked })}
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <Leaf size={18} className="text-green-600" />
                      <span className="text-sm font-semibold text-gray-700">Vegetarian</span>
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={saveEdit}
                        className="flex-1"
                      >
                        <Check size={18} className="mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelEdit}
                        className="flex-1"
                      >
                        <X size={18} className="mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.isVeg ? (
                          <div className="w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center flex-shrink-0">
                            <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-red-600 rounded flex items-center justify-center flex-shrink-0">
                            <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                          </div>
                        )}
                        <p className="font-bold text-lg text-gray-900 truncate">{item.name}</p>
                        {item.isAvailable === false && (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">
                            Sold Out
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-1 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3">
                        <p className="text-primary-600 font-semibold text-base">₹{formatPrice(item.price)}</p>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {item.category || 'Other'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        variant={item.isAvailable === false ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => toggleAvailability(item)}
                        className="px-3"
                      >
                        {item.isAvailable === false ? (
                          <Power size={16} className="mr-1" />
                        ) : (
                          <PowerOff size={16} className="mr-1" />
                        )}
                        {item.isAvailable === false ? 'Enable' : 'Disable'}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(item)}
                          className="px-3"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
