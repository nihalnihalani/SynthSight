import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Shield } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  showAgentStatus?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Processing...', 
  showAgentStatus = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const agents = [
    'Policy Enforcer',
    'Verifier Agent',
    'Audit Logger',
    'Response Agent'
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <Loader2 className={`${sizeClasses[size]} text-blue-600`} />
      </motion.div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">{text}</p>
        
        {showAgentStatus && (
          <motion.div 
            className="mt-3 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {agents.map((agent, index) => (
              <motion.div
                key={agent}
                className="flex items-center justify-center space-x-2 text-xs text-gray-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.3 }}
              >
                <Shield className="h-3 w-3 text-blue-500" />
                <span>Running {agent}...</span>
                <motion.div
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;