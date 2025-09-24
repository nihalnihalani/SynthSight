import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ThumbsUp, 
  ThumbsDown, 
  Flag,
  Shield,
  AlertCircle,
  Zap,
  AlertOctagon
} from 'lucide-react';
import { LLMInteraction } from '../types';
import { format } from 'date-fns';
import AgentBadge from './AgentBadge';
import SafetyBadge from './SafetyBadge';

interface InteractionCardProps {
  interaction: LLMInteraction;
  onAction: (id: string, action: 'approve' | 'block' | 'feedback', rating?: 'positive' | 'negative' | 'flag') => void;
}

const InteractionCard: React.FC<InteractionCardProps> = ({ interaction, onAction }) => {
  const getStatusIcon = () => {
    switch (interaction.status) {
      case 'approved':
        return <SafetyBadge status="safe" />;
      case 'blocked':
        return <SafetyBadge status="blocked" violationCount={interaction.violations.length} />;
      case 'pending':
        return <SafetyBadge status="flagged" violationCount={interaction.violations.length} />;
    }
  };

  const getSeverityColor = () => {
    switch (interaction.severity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  const getViolationColor = (type: string) => {
    switch (type) {
      case 'pii':
        return 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200';
      case 'gdpr':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200';
      case 'fisma':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-200';
      case 'eu_ai_act':
        return 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800 border-indigo-200';
      case 'dsa':
        return 'bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-800 border-cyan-200';
      case 'nis2':
        return 'bg-gradient-to-r from-teal-50 to-teal-100 text-teal-800 border-teal-200';
      case 'iso_42001':
        return 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200';
      case 'ieee_ethics':
        return 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-800 border-pink-200';
      case 'misinformation':
        return 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border-orange-200';
      case 'bias':
        return 'bg-gradient-to-r from-violet-50 to-violet-100 text-violet-800 border-violet-200';
      case 'hallucination':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200';
      case 'hate_speech':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-900 border-red-300';
      case 'compliance':
        return 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'pii':
      case 'gdpr':
        return <Shield className="h-4 w-4" />;
      case 'fisma':
      case 'nis2':
        return <Shield className="h-4 w-4" />;
      case 'eu_ai_act':
      case 'iso_42001':
      case 'ieee_ethics':
        return <AlertCircle className="h-4 w-4" />;
      case 'dsa':
        return <XCircle className="h-4 w-4" />;
      case 'misinformation':
        return <AlertCircle className="h-4 w-4" />;
      case 'bias':
        return <AlertTriangle className="h-4 w-4" />;
      case 'hallucination':
        return <AlertTriangle className="h-4 w-4" />;
      case 'hate_speech':
      case 'compliance':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="font-semibold text-gray-900">ID: {interaction.id}</h3>
            <p className="text-sm text-gray-500">
              {format(interaction.timestamp, 'MMM dd, yyyy HH:mm:ss')}
            </p>
            {interaction.llmSource && (
              <div className="flex items-center space-x-2 mt-1">
                {interaction.llmSource === 'groq' ? (
                  <div className="flex items-center space-x-1 text-xs text-green-600">
                    <Zap className="h-3 w-3" />
                    <span>Groq</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-xs text-orange-600">
                    <AlertOctagon className="h-3 w-3" />
                    <span>⚠️ Fallback mode</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {getStatusIcon()}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor()}`}>
            {interaction.severity.toUpperCase()}
          </span>
          {interaction.violations.length > 0 && (
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">{interaction.violations.length}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Input:</h4>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {interaction.input}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Output:</h4>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {interaction.output}
          </p>
        </div>


        {interaction.agentActions.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Agent Actions:</h4>
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {interaction.agentActions
                .reduce((unique: typeof interaction.agentActions, action) => {
                  // Remove duplicates based on agent name and action type
                  const isDuplicate = unique.some(existing => 
                    existing.agentName === action.agentName && 
                    existing.action === action.action &&
                    existing.details === action.details
                  );
                  
                  if (!isDuplicate) {
                    unique.push(action);
                  }
                  
                  return unique;
                }, [])
                .map((action, index) => (
                <AgentBadge
                  key={index}
                  agentName={action.agentName}
                  action={action.action as any}
                  details={action.details}
                  timestamp={action.timestamp}
                  animated={true}
                />
              ))}
            </motion.div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(interaction.id, 'feedback', 'positive')}
            className="flex items-center space-x-1 text-green-600 hover:text-green-700"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm">Helpful</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(interaction.id, 'feedback', 'negative')}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
          >
            <ThumbsDown className="h-4 w-4" />
            <span className="text-sm">Not Helpful</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(interaction.id, 'feedback', 'flag')}
            className="flex items-center space-x-1 text-orange-600 hover:text-orange-700"
          >
            <Flag className="h-4 w-4" />
            <span className="text-sm">Report</span>
          </motion.button>
        </div>

        {interaction.status === 'pending' && (
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction(interaction.id, 'approve')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Approve
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction(interaction.id, 'block')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Block
            </motion.button>
          </div>
        )}
        
        {(interaction.status === 'approved' || interaction.status === 'blocked') && (
          <div className="flex items-center space-x-2 text-green-600">
            {interaction.status === 'approved' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Approved</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">Blocked</span>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InteractionCard;