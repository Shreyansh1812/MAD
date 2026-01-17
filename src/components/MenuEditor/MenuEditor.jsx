/**
 * MenuEditor Component
 * Interface for adding and managing menu items
 */

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, UtensilsCrossed, Sparkles } from 'lucide-react';
import { Button } from '../Shared/Button';
import { Input } from '../Shared/Input';
import { Card, CardHeader, CardBody } from '../Shared/Card';
import { EmptyState } from '../Shared/EmptyState';
import { formatPrice } from '../../utils/validation';

export const MenuEditor = ({ menuItems, onAdd, onUpdate, onDelete, onToast }) => {
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', price: '' });
  const [errors, setErrors] = useState({ name: '', price: '' });
  const [highlightedId, setHighlightedId] = useState(null);

  /**
   * Handle adding new item
   */
  const handleAdd = () => {
    const result = onAdd(newItem);
    
    if (result.success) {
      setNewItem({ name: '', price: '' });
      onToast?.(`✨ ${result.item.name} added to menu!`, 'success');
      
      // Highlight new item
      setHighlightedId(result.item.id);
      setTimeout(() => setHighlightedId(null), 2000);
    } else {
      setErrors(prev => ({
        ...prev,
        [result.error.includes('name') ? 'name' : 'price']: result.error,
      }));
      onToast?.(result.error, 'error');
    }
  };

  /**
   * Handle starting edit mode
   */
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditData({ name: item.name, price: item.price.toString() });
    setErrors({ name: '', price: '' });
  };

  /**
   * Handle saving edit
   */
  const saveEdit = () => {
    const result = onUpdate(editingId, editData);
    
    if (result.success) {
      setEditingId(null);
      setEditData({ name: '', price: '' });
      setErrors({ name: '', price: '' });
      onToast?.('Item updated successfully!', 'success');
      
      // Highlight updated item
      setHighlightedId(editingId);
      setTimeout(() => setHighlightedId(null), 2000);
    } else {
      setErrors(prev => ({
        ...prev,
        [result.error.includes('name') ? 'name' : 'price']: result.error,
      }));
      onToast?.(result.error, 'error');
    }
  };

  /**
   * Handle canceling edit
   */
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', price: '' });
    setErrors({ name: '', price: '' });
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
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full shadow-lg hover:shadow-xl"
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
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                  highlightedId === item.id
                    ? 'bg-green-50 border-green-400 shadow-lg scale-105'
                    : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-md'
                }`}
              >
                {editingId === item.id ? (
                  // Edit Mode
                  <>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input
                        value={editData.name}
                        onChange={(e) => {
                          setEditData({ ...editData, name: e.target.value });
                          setErrors({ ...errors, name: '' });
                        }}
                        error={errors.name}
                        placeholder="Item name"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editData.price}
                        onChange={(e) => {
                          setEditData({ ...editData, price: e.target.value });
                          setErrors({ ...errors, price: '' });
                        }}
                        error={errors.price}
                        placeholder="Price"
                      />
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={saveEdit}
                        className="px-4"
                      >
                        <Check size={18} className="mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelEdit}
                        className="px-4"
                      >
                        <X size={18} className="mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  // Display Mode
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg text-gray-900 truncate">{item.name}</p>
                      <p className="text-primary-600 font-semibold text-base">₹{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(item)}
                        className="px-4 hover:scale-105"
                      >
                        <Edit2 size={16} className="mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.name)}
                        className="px-3 text-red-600 hover:bg-red-50 hover:text-red-700 hover:scale-105"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
