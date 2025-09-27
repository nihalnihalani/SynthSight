// components/MultiAIEvaluationDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Shield, 
  BarChart3,
  Eye,
  FileText,
  Clock,
  Target,
  Zap,
  Activity,
  PieChart,
  LineChart,
  ScatterChart
} from 'lucide-react';
import { MultiAIEvaluationResult, AIExpertEvaluation } from '../services/multiAIEvaluationService';

interface MultiAIEvaluationDashboardProps {
  evaluationResult: MultiAIEvaluationResult;
  onClose?: () => void;
}

const MultiAIEvaluationDashboard: React.FC<MultiAIEvaluationDashboardProps> = ({
  evaluationResult,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'experts' | 'research' | 'recommendations'>('overview');
  const [selectedExpert, setSelectedExpert] = useState<AIExpertEvaluation | null>(null);

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approve': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'approve_with_conditions': return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'needs_revision': return <XCircle className="w-6 h-6 text-orange-500" />;
      case 'reject': return <XCircle className="w-6 h-6 text-red-500" />;
      default: return <CheckCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approve': return 'text-green-600 bg-green-50 border-green-200';
      case 'approve_with_conditions': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'needs_revision': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'reject': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAgreementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Multi-AI Evaluation Results</h2>
                <p className="text-blue-100">Comprehensive synthetic data quality assessment</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'experts', label: 'Expert Analysis', icon: Users },
              { id: 'research', label: 'Research Criteria', icon: FileText },
              { id: 'recommendations', label: 'Recommendations', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Consensus Score</p>
                      <p className="text-3xl font-bold text-gray-900">{evaluationResult.consensusScore}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expert Agreement</p>
                      <p className={`text-lg font-semibold px-2 py-1 rounded-full ${getAgreementColor(evaluationResult.agreementLevel)}`}>
                        {evaluationResult.agreementLevel.toUpperCase()}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Final Decision</p>
                      <div className="flex items-center space-x-2">
                        {getDecisionIcon(evaluationResult.finalRecommendation.decision)}
                        <span className={`text-lg font-semibold px-2 py-1 rounded-full border ${getDecisionColor(evaluationResult.finalRecommendation.decision)}`}>
                          {evaluationResult.finalRecommendation.decision.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <Target className="w-8 h-8 text-purple-500" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Risk Level</p>
                      <p className={`text-lg font-semibold px-2 py-1 rounded-full ${getRiskColor(evaluationResult.finalRecommendation.riskAssessment)}`}>
                        {evaluationResult.finalRecommendation.riskAssessment.toUpperCase()}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-red-500" />
                  </div>
                </motion.div>
              </div>

              {/* Expert Scores Overview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expert Evaluation Scores</h3>
                <div className="space-y-4">
                  {evaluationResult.expertEvaluations.map((expert, index) => (
                    <motion.div
                      key={expert.expertName}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Brain className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{expert.expertName}</p>
                          <p className="text-sm text-gray-600">{expert.role.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{expert.evaluation.overallScore}</p>
                          <p className="text-sm text-gray-600">Confidence: {expert.evaluation.confidence}/10</p>
                        </div>
                        <div className="w-16 h-16 relative">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              className="text-gray-200"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - expert.evaluation.overallScore / 100)}`}
                              className="text-blue-500"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {expert.evaluation.overallScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Evaluation Metadata */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Evaluation Date</p>
                      <p className="font-medium">{evaluationResult.evaluationMetadata.evaluationDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">{evaluationResult.evaluationMetadata.evaluationDuration}ms</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Total Experts</p>
                      <p className="font-medium">{evaluationResult.evaluationMetadata.totalExperts}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experts' && (
            <div className="space-y-6">
              {/* Expert Selection */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {evaluationResult.expertEvaluations.map((expert) => (
                  <button
                    key={expert.expertName}
                    onClick={() => setSelectedExpert(expert)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedExpert?.expertName === expert.expertName
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Brain className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-900">{expert.expertName}</p>
                      <p className="text-sm text-gray-600">{expert.role.replace('_', ' ')}</p>
                      <p className="text-lg font-bold text-blue-600">{expert.evaluation.overallScore}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Expert Details */}
              {selectedExpert && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {selectedExpert.expertName} Analysis
                  </h3>
                  
                  {/* Detailed Analysis */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Detailed Analysis</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedExpert.evaluation.detailedAnalysis}
                    </p>
                  </div>

                  {/* Specific Metrics */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Specific Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {Object.entries(selectedExpert.evaluation.specificMetrics).map(([metric, score]) => (
                        <div key={metric} className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 relative">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-gray-200"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - score / 100)}`}
                                className="text-blue-500"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-900">{score}</span>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {selectedExpert.evaluation.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Concerns */}
                  {selectedExpert.evaluation.concerns.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Concerns</h4>
                      <ul className="space-y-2">
                        {selectedExpert.evaluation.concerns.map((concern, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'research' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Research-Backed Evaluation Criteria</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Industry Standards
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {evaluationResult.researchBackedCriteria.industryStandards.substring(0, 500)}...
                    </p>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Academic Research
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {evaluationResult.researchBackedCriteria.academicResearch.substring(0, 500)}...
                    </p>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Best Practices
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {evaluationResult.researchBackedCriteria.bestPractices.substring(0, 500)}...
                    </p>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Regulatory Guidance
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {evaluationResult.researchBackedCriteria.regulatoryGuidance.substring(0, 500)}...
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-md font-medium text-blue-900 mb-2">Research Sources Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {evaluationResult.evaluationMetadata.researchSourcesUsed.map((source, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              {/* Final Recommendation */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Recommendation</h3>
                
                <div className="flex items-center space-x-4 mb-4">
                  {getDecisionIcon(evaluationResult.finalRecommendation.decision)}
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {evaluationResult.finalRecommendation.decision.replace('_', ' ').toUpperCase()}
                    </h4>
                    <p className="text-gray-600">
                      Risk Level: <span className={`px-2 py-1 rounded-full text-sm font-medium ${getRiskColor(evaluationResult.finalRecommendation.riskAssessment)}`}>
                        {evaluationResult.finalRecommendation.riskAssessment.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Reasoning</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {evaluationResult.finalRecommendation.reasoning}
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Action Items</h4>
                  <ul className="space-y-2">
                    {evaluationResult.finalRecommendation.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MultiAIEvaluationDashboard;
