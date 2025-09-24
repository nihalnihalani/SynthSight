import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Settings, Database } from 'lucide-react';
import { firestoreService } from '../services/firestoreService';

interface FirebaseStatusProps {
  onConfigureClick?: () => void;
}

const FirebaseStatus: React.FC<FirebaseStatusProps> = ({ onConfigureClick }) => {
  const isConfigured = firestoreService.isConfigured();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg border ${
        isConfigured 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isConfigured ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          )}
          <div>
            <h3 className={`font-medium ${
              isConfigured ? 'text-green-900' : 'text-yellow-900'
            }`}>
              Firebase Firestore {isConfigured ? 'Connected' : 'Not Configured'}
            </h3>
            <p className={`text-sm ${
              isConfigured ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {isConfigured 
                ? 'Persistent data storage enabled' 
                : 'Using temporary mock storage - data will be lost on refresh'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Database className={`h-5 w-5 ${
            isConfigured ? 'text-green-600' : 'text-yellow-600'
          }`} />
          {!isConfigured && onConfigureClick && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfigureClick}
              className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Configure</span>
            </motion.button>
          )}
        </div>
      </div>
      
      {!isConfigured && (
        <div className="mt-3 p-3 bg-yellow-100 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>To enable Firebase Firestore:</strong>
          </p>
          <ol className="text-sm text-yellow-700 mt-1 ml-4 list-decimal">
            <li>Create a Firebase project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
            <li>Enable Firestore Database in your project</li>
            <li>Get your Firebase config from Project Settings</li>
            <li>Add the following to your .env file:</li>
          </ol>
          <div className="mt-2 p-2 bg-yellow-200 rounded text-xs font-mono">
            <div>VITE_FIREBASE_API_KEY=your_api_key</div>
            <div>VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com</div>
            <div>VITE_FIREBASE_PROJECT_ID=your_project_id</div>
            <div>VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com</div>
            <div>VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id</div>
            <div>VITE_FIREBASE_APP_ID=your_app_id</div>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            5. Restart the development server
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default FirebaseStatus;