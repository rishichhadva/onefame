import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Validate Firebase environment variables
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check for missing required variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => {
    // Convert camelCase to UPPER_SNAKE_CASE
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
    return `VITE_FIREBASE_${snakeKey}`;
  });

if (missingVars.length > 0) {
  const errorMsg = `Missing Firebase environment variables: ${missingVars.join(', ')}\n\nPlease add these to your .env file in the root directory.\nSee env.example for reference.`;
  console.error('❌', errorMsg);
  
  // In development, show a more helpful error
  if (import.meta.env.DEV) {
    console.error('\n📝 Quick fix:');
    console.error('1. Create/update .env file in project root');
    console.error('2. Add these variables (get values from Firebase Console):');
    missingVars.forEach(v => console.error(`   ${v}=your_value_here`));
    console.error('3. Restart your dev server (npm run dev)');
  }
  
  // Don't throw immediately - allow app to load but Firebase won't work
  // This prevents the app from crashing completely
}

// Only initialize Firebase if all required vars are present
let app: any = null;
let auth: any = null;

if (missingVars.length === 0) {
  const firebaseConfig = {
    apiKey: requiredEnvVars.apiKey,
    authDomain: requiredEnvVars.authDomain,
    projectId: requiredEnvVars.projectId,
    storageBucket: requiredEnvVars.storageBucket,
    messagingSenderId: requiredEnvVars.messagingSenderId,
    appId: requiredEnvVars.appId,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Optional
  };

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
} else {
  console.warn('⚠️ Firebase not initialized - missing environment variables');
}

export { auth };
