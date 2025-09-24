import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Settings } from 'lucide-react';
import { perplexityService } from '../services/perplexityService';

interface PerplexityStatusProps {
  onConfigureClick?: () => void;
}

const PerplexityStatus: React.FC<PerplexityStatusProps> = ({ onConfigureClick }) => {
  const isConfigured = perplexityService.isConfigured();

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
              Perplexity API {isConfigured ? 'Connected' : 'Not Configured'}
            </h3>
            <p className={`text-sm ${
              isConfigured ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {isConfigured 
                ? 'Real-time fact-checking enabled' 
                : 'Add API key to enable fact-checking'
              }
            </p>
          </div>
        </div>
        
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
      
      {!isConfigured && (
        <div className="mt-3 p-3 bg-yellow-100 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>To enable Perplexity verification:</strong>
          </p>
          <ol className="text-sm text-yellow-700 mt-1 ml-4 list-decimal">
            <li>Get your API key from <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="underline">Perplexity Settings</a></li>
            <li>Add <code className="bg-yellow-200 px-1 rounded">VITE_PERPLEXITY_API_KEY=your_key</code> to your .env file</li>
            <li>Restart the development server</li>
          </ol>
        </div>
      )}
    </motion.div>
  );
};

export default PerplexityStatus;