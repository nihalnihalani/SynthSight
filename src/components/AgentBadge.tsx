import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Clock, Shield, Eye, FileText, MessageSquare, Activity } from 'lucide-react';

interface AgentBadgeProps {
  agentName: string;
  action: 'flag' | 'approve' | 'suggest' | 'log' | 'verify';
  details: string;
  timestamp: Date;
  animated?: boolean;
}

const AgentBadge: React.FC<AgentBadgeProps> = ({ 
  agentName, 
  action, 
  details, 
  timestamp, 
  animated = true 
}) => {
  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'PolicyEnforcerAgent':
        return Shield;
      case 'VerifierAgent':
        return Eye;
      case 'AuditLoggerAgent':
        return FileText;
      case 'ResponseAgent':
        return MessageSquare;
      case 'FeedbackAgent':
        return Activity;
      default:
        return Shield;
    }
  };

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'flag':
      case 'block':
        return {
          icon: XCircle,
          color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-900 border-red-400 shadow-md',
          iconColor: 'text-red-600',
          emoji: action === 'block' ? '🚫' : '⚠️'
        };
      case 'approve':
        return {
          icon: CheckCircle,
          color: 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-300 shadow-sm',
          iconColor: 'text-green-600',
          emoji: '✅'
        };
      case 'verify':
        return {
          icon: CheckCircle,
          color: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-300 shadow-sm',
          iconColor: 'text-blue-600',
          emoji: '🔍'
        };
      case 'suggest':
        return {
          icon: AlertTriangle,
          color: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-300 shadow-sm',
          iconColor: 'text-amber-600',
          emoji: '💡'
        };
      case 'log':
        return {
          icon: Clock,
          color: 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-slate-300 shadow-sm',
          iconColor: 'text-slate-600',
          emoji: '📝'
        };
      default:
        return {
          icon: Clock,
          color: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-300 shadow-sm',
          iconColor: 'text-gray-600',
          emoji: '⚡'
        };
    }
  };

  const AgentIcon = getAgentIcon(agentName);
  const actionConfig = getActionConfig(action);
  const ActionIcon = actionConfig.icon;

  const formatAgentName = (name: string) => {
    return name.replace('Agent', '').replace(/([A-Z])/g, ' $1').trim();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8, y: 20 } : false}
      animate={animated ? { opacity: 1, scale: 1, y: 0 } : false}
      whileHover={{ scale: 1.02 }}
      className={`flex items-center justify-between p-4 rounded-xl border ${actionConfig.color} transition-all duration-300 hover:shadow-md backdrop-blur-sm`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-white/50 rounded-lg p-2">
          <AgentIcon className={`h-5 w-5 ${actionConfig.iconColor}`} />
          <ActionIcon className={`h-4 w-4 ${actionConfig.iconColor}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">
              {formatAgentName(agentName)}
            </span>
            <span className="text-base">{actionConfig.emoji}</span>
          </div>
          <p className="text-xs opacity-90 mt-1.5 leading-relaxed font-medium">{details}</p>
        </div>
      </div>
      
      <div className="text-right bg-white/30 rounded-md px-2 py-1">
        <span className="text-xs opacity-75 font-mono font-medium">
          {formatTime(timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

export default AgentBadge;