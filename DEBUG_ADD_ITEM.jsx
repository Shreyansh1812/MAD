/**
 * 🔍 DEBUGGING SCRIPT FOR ADD MENU ITEM ISSUE
 * Paste this into your MenuEditor.jsx component temporarily
 * 
 * INSTRUCTIONS:
 * 1. Replace your current handleAdd function with this debug version
 * 2. Open the app in browser
 * 3. Open DevTools Console (F12)
 * 4. Try adding an item
 * 5. Check console logs and alerts
 * 6. Check Network tab for Firebase requests
 */

// ============================================
// DEBUGGING VERSION OF handleAdd
// ============================================

const handleAddDebug = async () => {
  console.log('🔍 === DEBUG: ADD ITEM STARTED ===');
  
  // STEP 1: Log Auth State
  console.log('👤 STEP 1: Checking Authentication...');
  const currentUser = auth.currentUser;
  console.log('Current User:', currentUser);
  
  if (!currentUser) {
    const errorMsg = '❌ ERROR: No user authenticated! User must login first.';
    console.error(errorMsg);
    alert(errorMsg);
    onToast?.('Please login first!', 'error');
    return;
  }
  
  console.log('✅ User authenticated:', {
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName
  });
  
  // STEP 2: Log the Input Data
  console.log('📝 STEP 2: Input Data from Form...');
  console.log('Form State (newItem):', JSON.stringify(newItem, null, 2));
  
  // STEP 3: Prepare the Item Object
  console.log('🔧 STEP 3: Preparing Item for Firestore...');
  
  const itemToAdd = {
    name: newItem.name.trim(),
    price: parseFloat(newItem.price),
    description: newItem.description?.trim() || '',
    category: newItem.category || 'Main Course',
    isVeg: newItem.isVeg !== undefined ? newItem.isVeg : true,
    isAvailable: newItem.isAvailable !== undefined ? newItem.isAvailable : true,
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    addedAt: new Date().toISOString()
  };
  
  console.log('📦 Item to be sent to Firestore:', JSON.stringify(itemToAdd, null, 2));
  
  // STEP 4: Validate the Data
  console.log('✅ STEP 4: Validating Data...');
  
  if (!itemToAdd.name || itemToAdd.name === '') {
    const errorMsg = '❌ Validation Error: Item name is required';
    console.error(errorMsg);
    alert(errorMsg);
    return;
  }
  
  if (isNaN(itemToAdd.price) || itemToAdd.price <= 0) {
    const errorMsg = '❌ Validation Error: Price must be a positive number';
    console.error(errorMsg);
    alert(errorMsg);
    return;
  }
  
  console.log('✅ Validation passed!');
  
  // STEP 5: Check Firestore Reference
  console.log('🗂️ STEP 5: Checking Firestore Reference...');
  console.log('User ID (Document ID):', currentUser.uid);
  console.log('Collection:', 'menus');
  console.log('Full Path:', `menus/${currentUser.uid}`);
  
  try {
    // Import Firebase functions (add these imports at top of file)
    const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
    const { db, auth } = await import('../lib/firebase');
    
    const menuDocRef = doc(db, 'menus', currentUser.uid);
    console.log('📍 Document Reference Created:', menuDocRef);
    console.log('Document Path:', menuDocRef.path);
    
    // STEP 6: Attempt to Update Firestore
    console.log('🚀 STEP 6: Sending data to Firestore...');
    console.log('Using arrayUnion with item:', itemToAdd);
    
    await updateDoc(menuDocRef, {
      items: arrayUnion(itemToAdd),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ SUCCESS! Item added to Firestore');
    alert(`✅ SUCCESS!\n\nItem "${itemToAdd.name}" added successfully!\n\nCheck Firebase Console now.`);
    
    // Reset form
    setNewItem({ 
      name: '', 
      price: '', 
      description: '', 
      category: 'Main Course',
      isVeg: true,
      isAvailable: true
    });
    
    onToast?.(`✨ ${itemToAdd.name} added to menu!`, 'success');
    
  } catch (error) {
    // STEP 7: Comprehensive Error Logging
    console.error('❌ === FIRESTORE ERROR DETECTED ===');
    console.error('Error Object:', error);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    // Detailed error alert for mobile
    let errorDetails = `❌ FIREBASE ERROR\n\n`;
    errorDetails += `Code: ${error.code}\n\n`;
    errorDetails += `Message: ${error.message}\n\n`;
    
    // Specific error handling
    if (error.code === 'permission-denied') {
      errorDetails += `⚠️ PERMISSION DENIED!\n\n`;
      errorDetails += `Possible causes:\n`;
      errorDetails += `1. Firestore rules are blocking the request\n`;
      errorDetails += `2. User is not authenticated properly\n`;
      errorDetails += `3. Document doesn't exist yet\n\n`;
      errorDetails += `Solution: Check Firestore Rules and ensure document exists`;
    } else if (error.code === 'not-found') {
      errorDetails += `⚠️ DOCUMENT NOT FOUND!\n\n`;
      errorDetails += `The menu document doesn't exist yet.\n\n`;
      errorDetails += `Solution: Save Stall Settings first to create the document`;
    } else if (error.code === 'unauthenticated') {
      errorDetails += `⚠️ NOT AUTHENTICATED!\n\n`;
      errorDetails += `Solution: Login again`;
    }
    
    alert(errorDetails);
    onToast?.(`Error: ${error.message}`, 'error');
  }
  
  console.log('🔍 === DEBUG: ADD ITEM ENDED ===');
};

// ============================================
// HOW TO CHECK NETWORK TAB
// ============================================

/**
 * NETWORK TAB DEBUGGING INSTRUCTIONS:
 * 
 * 1. Open your app in Chrome/Edge browser
 * 2. Press F12 to open DevTools
 * 3. Click on "Network" tab
 * 4. In the filter box, type: firestore.googleapis.com
 * 5. Click "Clear" button (🚫) to clear existing requests
 * 6. Now try adding an item in your app
 * 7. You should see new requests appear
 * 
 * WHAT TO LOOK FOR:
 * 
 * ✅ SUCCESS (Status 200):
 *    - Request appears with green status code "200"
 *    - This means item was added successfully
 *    - If you see this but item doesn't appear, it's a UI refresh issue
 * 
 * ❌ PERMISSION DENIED (Status 403):
 *    - Red status code "403"
 *    - Error message: "Missing or insufficient permissions"
 *    - SOLUTION: Fix Firestore Security Rules
 *    - Rule needed:
 *      match /menus/{userId} {
 *        allow read, write: if request.auth != null && request.auth.uid == userId;
 *      }
 * 
 * ❌ NOT FOUND (Status 404):
 *    - Red status code "404"
 *    - Error message: "Document not found"
 *    - SOLUTION: Create document first by saving Stall Settings
 *    - Or use setDoc instead of updateDoc
 * 
 * ❌ INVALID ARGUMENT (Status 400):
 *    - Red status code "400"
 *    - Error message: "Invalid document path" or "Invalid data"
 *    - SOLUTION: Check the item object structure
 *    - Ensure all fields have valid types (string, number, boolean)
 * 
 * 🔍 TO VIEW REQUEST DETAILS:
 *    1. Click on the request in Network tab
 *    2. Click "Payload" tab to see data being sent
 *    3. Click "Response" tab to see error details
 *    4. Click "Headers" tab to see authentication token
 */

// ============================================
// QUICK FIX: Use setDoc with merge instead
// ============================================

/**
 * If updateDoc keeps failing with "not-found" error,
 * use this alternative that creates document if needed:
 */

const handleAddWithSetDoc = async () => {
  try {
    const { doc, setDoc, arrayUnion } = await import('firebase/firestore');
    const { db, auth } = await import('../lib/firebase');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('Please login first');
      return;
    }
    
    const itemToAdd = {
      name: newItem.name.trim(),
      price: parseFloat(newItem.price),
      id: `item_${Date.now()}`,
      addedAt: new Date().toISOString()
    };
    
    console.log('Adding item with setDoc + merge:', itemToAdd);
    
    const menuDocRef = doc(db, 'menus', currentUser.uid);
    
    // This will create document if it doesn't exist
    await setDoc(menuDocRef, {
      items: arrayUnion(itemToAdd),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('✅ Item added successfully!');
    alert('✅ Item added! Check Firebase Console.');
    
  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.code}\n${error.message}`);
  }
};

// ============================================
// EXPORT FOR TESTING
// ============================================

export {
  handleAddDebug,
  handleAddWithSetDoc
};
