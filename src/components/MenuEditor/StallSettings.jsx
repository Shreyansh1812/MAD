/**
 * StallSettings Component  
 * Manage stall branding and metadata
 */

import { useState, useEffect } from 'react';
import { Store, Clock, Save } from 'lucide-react';
import { Button } from '../Shared/Button';
import { Input } from '../Shared/Input';
import { Card, CardHeader, CardBody } from '../Shared/Card';
import storageService from '../../services/storageService';

export const StallSettings = ({ onSave, onToast }) => {
  const [stallName, setStallName] = useState('');
  const [waitTime, setWaitTime] = useState('');
  const [errors, setErrors] = useState({ stallName: '', waitTime: '' });

  // Load saved settings on mount
  useEffect(() => {
    const saved = storageService.loadStallData();
    setStallName(saved.stallName || '');
    setWaitTime(saved.waitTime || '');
  }, []);

  const handleSave = () => {
    // Basic validation
    if (!stallName.trim()) {
      setErrors({ ...errors, stallName: 'Stall name is required' });
      onToast?.('Stall name is required', 'error');
      return;
    }

    const stallData = {
      stallName: stallName.trim(),
      waitTime: waitTime.trim(),
    };

    const saved = storageService.saveStallData(stallData);
    
    if (saved) {
      onSave?.(stallData);
      onToast?.('✓ Stall settings saved!', 'success');
    } else {
      onToast?.('Failed to save settings', 'error');
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2.5 rounded-xl shadow-md">
            <Store size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Stall Settings</h2>
            <p className="text-sm text-gray-600 mt-0.5">Your branding & customer info</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        <Input
          label="Stall Name"
          placeholder="e.g., Rajesh's Food Corner"
          value={stallName}
          onChange={(e) => {
            setStallName(e.target.value);
            setErrors({ ...errors, stallName: '' });
          }}
          error={errors.stallName}
          icon={Store}
          required
        />

        <Input
          label="Estimated Wait Time (Optional)"
          placeholder="e.g., 10-15 mins, 5-10 mins"
          value={waitTime}
          onChange={(e) => {
            setWaitTime(e.target.value);
            setErrors({ ...errors, waitTime: '' });
          }}
          error={errors.waitTime}
          icon={Clock}
          maxLength={20}
        />

        <Button
          variant="primary"
          size="lg"
          className="w-full shadow-lg hover:shadow-xl"
          onClick={handleSave}
        >
          <Save size={20} />
          Save Settings
        </Button>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These details will appear on the customer's menu view when they scan your QR code.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};
