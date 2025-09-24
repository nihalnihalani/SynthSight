import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Settings, Database } from 'lucide-react';
import { neo4jService } from '../config/neo4j';

interface Neo4jStatusProps {
  onConfigureClick?: () => void;
}

const Neo4jStatus: React.FC<Neo4jStatusProps> = ({ onConfigureClick }) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true);
      const configured = neo4jService.isConfigured();
      setIsConfigured(configured);
      
      if (configured) {
        try {
          const connected = await neo4jService.testConnection();
          setIsConnected(connected);
        } catch (error) {
          console.error('Neo4j connection test failed:', error);
          setIsConnected(false);
        }
      }
      setIsLoading(false);
    };

    checkStatus();
  }, []);

  const getStatusIcon = () => {
    if (isLoading) {
      return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>;
    }
    
    if (isConfigured && isConnected) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (isConfigured && !isConnected) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    if (isConfigured && isConnected) {
      return 'border-green-200 bg-green-50';
    } else if (isConfigured && !isConnected) {
      return 'border-red-200 bg-red-50';
    } else {
      return 'border-yellow-200 bg-yellow-50';
    }
  };

  const getStatusText = () => {
    if (isLoading) {
      return 'Checking connection...';
    }
    
    if (isConfigured && isConnected) {
      return 'Connected';
    } else if (isConfigured && !isConnected) {
      return 'Configuration Error';
    } else {
      return 'Not Configured';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="h-6 w-6 text-gray-600" />
          <div>
            <h3 className={`font-medium ${
              isConfigured && isConnected ? 'text-green-900' : 
              isConfigured && !isConnected ? 'text-red-900' : 'text-yellow-900'
            }`}>
              Neo4j Database {getStatusText()}
            </h3>
            <p className={`text-sm ${
              isConfigured && isConnected ? 'text-green-700' : 
              isConfigured && !isConnected ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {isConfigured && isConnected ? 
                'Graph database ready for AI governance data' :
                isConfigured && !isConnected ?
                'Database configured but connection failed' :
                'Configure Neo4j for persistent data storage'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          {onConfigureClick && (
            <button
              onClick={onConfigureClick}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Configure Neo4j"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!isConfigured && (
        <div className="mt-3 p-3 bg-yellow-100 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>To enable Neo4j Database:</strong>
          </p>
          <ol className="text-sm text-yellow-700 mt-1 ml-4 list-decimal">
            <li>Create a Neo4j Aura instance at <a href="https://console.neo4j.io" target="_blank" rel="noopener noreferrer" className="underline">Neo4j Console</a></li>
            <li>Get your connection details from the instance</li>
            <li>Add the following to your .env file:</li>
          </ol>
          <div className="mt-2 p-2 bg-yellow-200 rounded text-xs font-mono">
            <div>VITE_NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io</div>
            <div>VITE_NEO4J_USERNAME=your_username</div>
            <div>VITE_NEO4J_PASSWORD=your_password</div>
            <div>VITE_NEO4J_DATABASE=your_database</div>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            4. Restart the development server
          </p>
        </div>
      )}

      {isConfigured && !isConnected && (
        <div className="mt-3 p-3 bg-red-100 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Connection Failed:</strong>
          </p>
          <p className="text-sm text-red-700 mt-1">
            Neo4j is configured but the connection failed. Please check:
          </p>
          <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
            <li>Your Neo4j instance is running</li>
            <li>Connection credentials are correct</li>
            <li>Network connectivity to Neo4j Aura</li>
            <li>Database name exists</li>
          </ul>
        </div>
      )}

      {isConfigured && isConnected && (
        <div className="mt-3 p-3 bg-green-100 rounded-md">
          <p className="text-sm text-green-800">
            <strong>Neo4j Features:</strong>
          </p>
          <ul className="text-sm text-green-700 mt-1 ml-4 list-disc">
            <li>Graph-based data relationships</li>
            <li>Advanced querying with Cypher</li>
            <li>Scalable AI governance data storage</li>
            <li>Real-time analytics and insights</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Neo4jStatus;
