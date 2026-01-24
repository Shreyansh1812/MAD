/**
 * StallSettings Component  
 * Manage stall branding and metadata
 * Practical 06: Integrated with Firebase CRUD Operations
 */

import { useState, useEffect } from 'react';
import { Store, Clock, Save } from 'lucide-react';
import { Button } from '../Shared/Button';
import { Input } from '../Shared/Input';
import { Card, CardHeader, CardBody } from '../Shared/Card';
import { saveSettings, getMenuData } from '../../services/menuCRUDService';

export const StallSettings = ({ onSave, onToast }) => {
  const [stallName, setStallName] = useState('');
  const [waitTime, setWaitTime] = useState('');
  const [errors, setErrors] = useState({ stallName: '', waitTime: '' });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Load saved settings from Firebase on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoadingData(true);
        const menuData = await getMenuData();
        
        if (menuData) {
          setStallName(menuData.stallName || '');
          setWaitTime(menuData.waitTime?.toString() || '');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Silently fail if user is not authenticated or no data exists
      } finally {
        setLoadingData(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    // Basic validation
    if (!stallName.trim()) {
      setErrors({ ...errors, stallName: 'Stall name is required' });
      onToast?.('Stall name is required', 'error');
      return;
    }

    // Validate wait time is a number
    const waitTimeNum = parseInt(waitTime) || 0;
    if (waitTimeNum < 0) {
      setErrors({ ...errors, waitTime: 'Wait time must be positive' });
      onToast?.('Wait time must be a positive number', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const stallData = {
        stallName: stallName.trim(),
        waitTime: waitTimeNum,
      };

      // PRACTICAL 06: CREATE/UPDATE operation using Firebase
      const result = await saveSettings(stallData);
      
      if (result.success) {
        onSave?.(stallData);
        onToast?.('✓ Stall settings saved to Firebase!', 'success');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      onToast?.('Failed to save settings: ' + error.message, 'error');
    } finally {
      setLoading(false);
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
            <p className="text-sm text-gray-600 mt-0.5">
              {loadingData ? 'Loading from Firebase...' : 'Your branding & customer info'}
            </p>
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
          disabled={loadingData}
        />

        <Input
          label="Estimated Wait Time (in minutes)"
          placeholder="e.g., 10"
          type="number"
          value={waitTime}
          onChange={(e) => {
            setWaitTime(e.target.value);
            setErrors({ ...errors, waitTime: '' });
          }}
          error={errors.waitTime}
          icon={Clock}
          disabled={loadingData}
        />

        <Button
          variant="primary"
          size="lg"
          className="w-full shadow-lg hover:shadow-xl"
          onClick={handleSave}
          disabled={loading || loadingData}
        >
          <Save size={20} />
          {loading ? 'Saving to Firebase...' : 'Save Settings'}
        </Button>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>🔥 Firebase CRUD:</strong> These settings are saved using <code>setDoc()</code> with merge option. Data persists across devices!
          </p>
        </div>
        
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800">
            <strong>Note:</strong> These details will appear on the customer's menu view when they scan your QR code.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};
