import React from 'react';
import { CheckCircle, AlertTriangle, Settings, Zap } from 'lucide-react';
import { isOpenAIConfigured } from '../lib/openaiAgent';

interface OpenAIStatusProps {
  onConfigureClick?: () => void;
}

const OpenAIStatus: React.FC<OpenAIStatusProps> = ({ onConfigureClick }) => {
  const isConfigured = isOpenAIConfigured();

  return (
    <div className={`border rounded-lg p-6 bg-white ${
      isConfigured ? 'border-gray-200' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="h-5 w-5 text-black" />
          <div>
            <h3 className="font-medium text-black">
              OpenAI GPT {isConfigured ? 'Connected' : 'Not Configured'}
            </h3>
            <p className="text-sm text-gray-500">
              {isConfigured ? 
                'Primary LLM provider for AI governance analysis' :
                'Configure OpenAI for enhanced AI responses'
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
              title="Configure OpenAI"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isConfigured && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-700 font-medium mb-2">
            OpenAI Features:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• GPT-3.5-turbo for high-quality responses</li>
            <li>• Advanced natural language understanding</li>
            <li>• Primary LLM with Groq fallback</li>
            <li>• Enhanced policy violation detection</li>
          </ul>
        </div>
      )}

      {!isConfigured && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-700 font-medium mb-2">
            To enable OpenAI:
          </p>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Get an API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline text-black hover:text-gray-600">OpenAI Platform</a></li>
            <li>2. Add to your .env file:</li>
          </ol>
          <div className="mt-2 p-3 bg-white border border-gray-200 rounded text-xs font-mono text-gray-700">
            <div>VITE_OPENAI_API_KEY=sk-proj-your_api_key_here</div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            3. Restart the development server
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Note: Without OpenAI, the system will use Groq as the primary LLM provider.
          </p>
        </div>
      )}
    </div>
  );
};

export default OpenAIStatus;
