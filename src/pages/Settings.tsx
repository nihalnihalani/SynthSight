import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Shield, Activity, FileText, MessageSquare, CheckCircle } from 'lucide-react';
import { apiService } from '../api/apiService';
import { AgentSettings } from '../types';
import PerplexityStatus from '../components/PerplexityStatus';
import Neo4jStatus from '../components/Neo4jStatus';
import GroqStatus from '../components/GroqStatus';
import OpenAIStatus from '../components/OpenAIStatus';
import { useToast } from '../hooks/useToast';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AgentSettings>({
    policyEnforcer: { enabled: true },
    verifier: { enabled: true },
    auditLogger: { enabled: true },
    responseAgent: { enabled: true },
    feedbackAgent: { enabled: true },
    severityThreshold: 7.0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      const currentSettings = await apiService.getSettings();
      setSettings(currentSettings);
    };
    fetchSettings();
  }, []);

  const handleToggleAgent = (agentKey: keyof Omit<AgentSettings, 'severityThreshold'>) => {
    setSettings(prev => ({
      ...prev,
      [agentKey]: { enabled: !prev[agentKey].enabled }
    }));
  };

  const handleThresholdChange = (value: number) => {
    setSettings(prev => ({
      ...prev,
      severityThreshold: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await apiService.updateSettings(settings);
      setIsSaved(true);
      toast.success('Settings Saved', 'Agent configuration updated successfully');
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Save Failed', 'Unable to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    const defaultSettings: AgentSettings = {
      policyEnforcer: { enabled: true },
      verifier: { enabled: true },
      auditLogger: { enabled: true },
      responseAgent: { enabled: true },
      feedbackAgent: { enabled: true },
      severityThreshold: 7.0
    };
    setSettings(defaultSettings);
    toast.info('Settings Reset', 'All settings restored to defaults');
  };

  const agentConfigs = [
    {
      key: 'policyEnforcer' as const,
      name: 'Policy Enforcer Agent',
      description: 'Detects compliance violations like PII, bias, and hate speech',
      icon: Shield,
      color: 'text-blue-600'
    },
    {
      key: 'verifier' as const,
      name: 'Verifier Agent',
      description: 'Uses Perplexity API to verify high-risk content for misinformation',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      key: 'auditLogger' as const,
      name: 'Audit Logger Agent',
      description: 'Logs all agent actions and maintains audit trails',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      key: 'responseAgent' as const,
      name: 'Response Agent',
      description: 'Provides safety recommendations for flagged content',
      icon: MessageSquare,
      color: 'text-orange-600'
    },
    {
      key: 'feedbackAgent' as const,
      name: 'Feedback Agent',
      description: 'Collects and processes user feedback for continuous improvement',
      icon: Activity,
      color: 'text-red-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8 bg-white min-h-screen"
    >
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-semibold text-black">Settings</h1>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-colors ${
              isSaved 
                ? 'bg-green-600 text-white' 
                : isLoading 
                ? 'bg-gray-400 text-white' 
                : 'bg-black text-white hover:bg-gray-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSaved ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSaved ? 'Saved!' : isLoading ? 'Saving...' : 'Save Settings'}</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Status */}
        <div className="lg:col-span-2 space-y-4">
          <OpenAIStatus />
          <GroqStatus />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PerplexityStatus />
            <Neo4jStatus />
          </div>
        </div>

        {/* Agent Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Configuration</h2>
          <div className="space-y-4">
            {agentConfigs.map((agent) => (
              <motion.div
                key={agent.key}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                whileHover={{ backgroundColor: '#f9fafb' }}
              >
                <div className="flex items-start space-x-3">
                  <agent.icon className={`h-6 w-6 ${agent.color} mt-1`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleAgent(agent.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings[agent.key].enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <motion.span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings[agent.key].enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                      layout
                    />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Severity Threshold */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Severity Threshold</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Block Threshold (0-10 scale)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={settings.severityThreshold}
                  onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="w-16 text-center">
                  <span className="text-lg font-semibold text-gray-900">
                    {settings.severityThreshold.toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Interactions with severity scores above this threshold will be automatically blocked.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4">
              <div className="text-center">
                <div className="w-full h-2 bg-green-200 rounded mb-1"></div>
                <span className="text-xs text-gray-600">0-2.5</span>
                <p className="text-xs text-green-600 font-medium">Low</p>
              </div>
              <div className="text-center">
                <div className="w-full h-2 bg-yellow-200 rounded mb-1"></div>
                <span className="text-xs text-gray-600">2.5-5</span>
                <p className="text-xs text-yellow-600 font-medium">Medium</p>
              </div>
              <div className="text-center">
                <div className="w-full h-2 bg-orange-200 rounded mb-1"></div>
                <span className="text-xs text-gray-600">5-7.5</span>
                <p className="text-xs text-orange-600 font-medium">High</p>
              </div>
              <div className="text-center">
                <div className="w-full h-2 bg-red-200 rounded mb-1"></div>
                <span className="text-xs text-gray-600">7.5-10</span>
                <p className="text-xs text-red-600 font-medium">Critical</p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Current Configuration</h3>
            <div className="space-y-1 text-sm">
              <p className="text-blue-800">
                <span className="font-medium">Active Agents:</span>{' '}
                {Object.entries(settings).filter(([key, value]) => 
                  key !== 'severityThreshold' && value.enabled
                ).length} of 5
              </p>
              <p className="text-blue-800">
                <span className="font-medium">Block Threshold:</span> {settings.severityThreshold.toFixed(1)}/10
              </p>
              <p className="text-blue-800">
                <span className="font-medium">Status:</span>{' '}
                {Object.entries(settings).filter(([key]) => key !== 'severityThreshold').every(([, value]) => value.enabled)
                  ? 'Full Protection' 
                  : 'Partial Protection'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Status Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-green-900">System Online</p>
            <p className="text-xs text-green-700">All systems operational</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-3 h-3 bg-blue-400 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-blue-900">Real-time Monitoring</p>
            <p className="text-xs text-blue-700">Active threat detection</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-3 h-3 bg-purple-400 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium text-purple-900">Audit Logging</p>
            <p className="text-xs text-purple-700">Complete activity tracking</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;