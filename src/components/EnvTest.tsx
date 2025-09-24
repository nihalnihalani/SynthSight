import React from 'react';

export const EnvTest: React.FC = () => {
  const envVars = {
    'VITE_NEO4J_URI': import.meta.env.VITE_NEO4J_URI,
    'VITE_NEO4J_USERNAME': import.meta.env.VITE_NEO4J_USERNAME,
    'VITE_NEO4J_PASSWORD': import.meta.env.VITE_NEO4J_PASSWORD ? '***HIDDEN***' : undefined,
    'VITE_NEO4J_DATABASE': import.meta.env.VITE_NEO4J_DATABASE,
    'VITE_OPENAI_API_KEY': import.meta.env.VITE_OPENAI_API_KEY ? '***HIDDEN***' : undefined,
    'VITE_PERPLEXITY_API_KEY': import.meta.env.VITE_PERPLEXITY_API_KEY ? '***HIDDEN***' : undefined
  };

  console.log('🔍 Environment Variables Check:', envVars);

  const neo4jConfigured = envVars.VITE_NEO4J_URI && 
                         envVars.VITE_NEO4J_USERNAME && 
                         envVars.VITE_NEO4J_PASSWORD && 
                         envVars.VITE_NEO4J_DATABASE;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Environment Variables Test</h2>
      
      <div className="space-y-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <span className={value ? 'text-green-600' : 'text-red-600'}>
              {value ? '✅' : '❌'}
            </span>
            <span className="font-mono text-sm">{key}:</span>
            <span className="text-gray-600">{value || 'NOT SET'}</span>
          </div>
        ))}
      </div>

      <div className={`mt-4 p-3 rounded ${neo4jConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        <strong>Neo4j Configuration: {neo4jConfigured ? '✅ COMPLETE' : '❌ INCOMPLETE'}</strong>
        {!neo4jConfigured && (
          <p className="mt-2 text-sm">
            <strong>ISSUE:</strong> Neo4j environment variables are missing! This is why data is not persisting.
          </p>
        )}
      </div>
    </div>
  );
};

export default EnvTest;
