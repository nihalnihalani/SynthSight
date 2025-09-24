import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Settings, Zap } from 'lucide-react';
import { isGroqConfigured } from '../lib/groqAgent';

interface GroqStatusProps {
  onConfigureClick?: () => void;
}

const GroqStatus: React.FC<GroqStatusProps> = ({ onConfigureClick }) => {
  const isConfigured = isGroqConfigured();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border rounded-lg p-6 bg-white border-gray-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="h-5 w-5 text-black" />
          <div>
            <h3 className="font-medium text-black">
              Groq API {isConfigured ? 'Connected' : 'Not Configured'}
            </h3>
            <p className="text-sm text-gray-500">
              {isConfigured 
                ? 'Ultra-fast LLM inference enabled' 
                : 'Add API key to enable real LLM responses'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConfigured ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-gray-400" />
          )}
          {onConfigureClick && (
            <button
              onClick={onConfigureClick}
              className="p-1 text-gray-400 hover:text-black transition-colors"
              title="Configure Groq"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {!isConfigured && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-700 font-medium mb-2">
            To enable Groq API:
          </p>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Get your API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline text-black hover:text-gray-600">Groq Console</a></li>
            <li>2. Add to your .env file:</li>
          </ol>
          <div className="mt-2 p-3 bg-white border border-gray-200 rounded text-xs font-mono text-gray-700">
            VITE_GROQ_API_KEY=your_key
          </div>
          <p className="text-sm text-gray-600 mt-2">
            3. Restart the development server
          </p>
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded text-xs text-gray-600">
            <strong>Benefits:</strong> Ultra-fast inference (up to 500+ tokens/sec), high-quality responses, cost-effective
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GroqStatus;