import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InteractionCard from '../components/InteractionCard';
import PromptTester from '../components/PromptTester';
import { apiService } from '../api/apiService';
import { LLMInteraction } from '../types';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import EmptyState from '../components/EmptyState';
import { Activity, RefreshCw } from 'lucide-react';

const LiveMonitor: React.FC = () => {
  const [interactions, setInteractions] = useState<LLMInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchInteractions = async () => {
      const data = await apiService.getInteractions();
      setInteractions(data);
    };

    // Only fetch on initial load - no auto-refresh
    fetchInteractions();
  }, []);

  const handlePromptSubmit = async (prompt: string) => {
    setIsLoading(true);
    
    try {
      const interaction = await apiService.processPrompt(prompt);
      setInteractions(prev => [interaction, ...prev]);
      
      // Show toast based on result
      if (interaction.status === 'blocked') {
        toast.error('Prompt Blocked', `${interaction.violations.length} violation(s) detected`);
      } else if (interaction.status === 'pending') {
        toast.warning('Prompt Flagged', 'Content requires review');
      } else {
        toast.success('Prompt Approved', 'No violations detected');
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
      toast.error('Processing Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    try {
      const data = await apiService.getInteractions();
      setInteractions(data);
      toast.success('Refreshed', 'Interactions updated successfully');
    } catch (error) {
      toast.error('Refresh Failed', 'Unable to fetch latest interactions');
    }
  };

  const handleInteractionAction = async (id: string, action: string, rating?: 'positive' | 'negative' | 'flag') => {
    if (action === 'feedback' && rating) {
      try {
        await apiService.submitFeedback(id, rating);
        toast.success('Feedback Submitted', 'Thank you for your feedback!');
        
        // Trigger feedback agent processing
        const interactions = await apiService.getInteractions();
        setInteractions(interactions);
      } catch (error) {
        toast.error('Feedback Failed', 'Unable to submit feedback');
      }
      
      // Only update feedback, don't change status
      setInteractions(prev => 
        prev.map(interaction => 
          interaction.id === id 
            ? { 
                ...interaction, 
                userFeedback: {
                  rating: rating === 'flag' ? 'report' : rating,
                  timestamp: new Date()
                }
              }
            : interaction
        )
      );
      return;
    }
    
    // Handle approve/block actions
    if (action === 'approve' || action === 'block') {
      const newStatus = action === 'approve' ? 'approved' as const : 'blocked' as const;
      
      // Update status immediately for UI feedback
      setInteractions(prev => 
        prev.map(interaction => 
          interaction.id === id 
            ? { ...interaction, status: newStatus }
            : interaction
        )
      );
      
      if (action === 'approve') {
        toast.success('Interaction Approved', 'Content has been approved for use');
      } else {
        toast.error('Interaction Blocked', 'Content has been blocked due to violations');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8 bg-white min-h-screen"
    >
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-semibold text-black">Live Monitor</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleManualRefresh}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh interactions"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Manual refresh only</span>
          </div>
        </div>
      </div>
      
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      
      <PromptTester onSubmit={handlePromptSubmit} isLoading={isLoading} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Interactions ({interactions.length})
        </h2>
        
        {interactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <EmptyState
              icon={Activity}
              title="No interactions yet"
              description="Submit a prompt above to test the AI governance system and see how our agents analyze and respond to different types of content."
              action={{
                label: "Try a Sample Prompt",
                onClick: () => {
                  // This would scroll to the prompt tester
                  document.querySelector('textarea')?.focus();
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {interactions.map((interaction) => (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                onAction={handleInteractionAction}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveMonitor;