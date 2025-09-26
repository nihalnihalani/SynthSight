import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, FileText, Download, Trash2, BarChart3, CheckCircle, AlertTriangle, RefreshCw, ScrollText, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { landingAIService, LandingAIResponse } from '../services/landingAIService';
import { useDocumentContext, ExtractedDocument } from '../contexts/DocumentContext';

const DataEvaluation: React.FC = () => {
  const { extractedDocuments, removeDocument, updateDocument, addDocument } = useDocumentContext();
  const [evaluationResults, setEvaluationResults] = useState<Array<{
    id: string;
    fileName: string;
    qualityScore: number;
    gdprCompliance: number;
    dataIntegrity: number;
    completeness: number;
    accuracy: number;
    timestamp: Date;
    status: 'evaluating' | 'completed' | 'error';
    issues: Array<{
      type: 'warning' | 'error' | 'info';
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }>>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const toast = useToast();

  // Documents are now managed by the DocumentContext
  // Add some sample documents for demonstration
  useEffect(() => {
    if (extractedDocuments.length === 0) {
      const sampleDocuments: ExtractedDocument[] = [
        {
          id: 'sample-1',
          fileName: 'Synthetic Data Enterprise Toolkit.pdf',
          uploadDate: new Date(),
          content: 'This enterprise guidelines document begins with an enterprise profile (SynthData Inc.) and positions synthetic data as a strategic asset, not just governance. The toolkit covers comprehensive data governance policies and procedures with a focus on synthetic data generation and management. It establishes clear frameworks for data classification, access controls, retention policies, and compliance monitoring. Key applications include training data augmentation, rare-event simulation, privacy-safe sharing, and industry-specific use cases across healthcare, finance, and autonomous systems. The document reviews both commercial platforms (Gretel, MOSTLY AI, K2View) and open-source tools (SDV, Synthea, Faker) for synthetic data generation. The evaluation framework emphasizes three critical lenses: fidelity (statistical accuracy), utility (business value), and privacy validation (differential privacy compliance). Workflow integration covers embedding synthetic data processes in CI/CD pipelines, monitoring data drift, and securing data pipelines throughout the lifecycle. Risk mitigation strategies include differential privacy implementation, bias detection algorithms, granular access controls, and comprehensive audit logging. The document balances governance requirements with practical implementation guidance, reflecting the toolkit\'s broader scope beyond traditional data governance to encompass strategic synthetic data initiatives.',
          summary: 'This enterprise guidelines document begins with an enterprise profile (SynthData Inc.) and positions synthetic data as a strategic asset, not just governance. The toolkit covers comprehensive data governance policies and procedures with a focus on synthetic data generation and management. It establishes clear frameworks for data classification, access controls, retention policies, and compliance monitoring. Key applications include training data augmentation, rare-event simulation, privacy-safe sharing, and industry-specific use cases across healthcare, finance, and autonomous systems. The document reviews both commercial platforms (Gretel, MOSTLY AI, K2View) and open-source tools (SDV, Synthea, Faker) for synthetic data generation. The evaluation framework emphasizes three critical lenses: fidelity (statistical accuracy), utility (business value), and privacy validation (differential privacy compliance). Workflow integration covers embedding synthetic data processes in CI/CD pipelines, monitoring data drift, and securing data pipelines throughout the lifecycle. Risk mitigation strategies include differential privacy implementation, bias detection algorithms, granular access controls, and comprehensive audit logging. The document balances governance requirements with practical implementation guidance, reflecting the toolkit\'s broader scope beyond traditional data governance to encompass strategic synthetic data initiatives.',
          metadata: {
            title: 'Synthetic Data Enterprise Toolkit',
            author: 'Data Governance Team',
            pages: 8,
            wordCount: 1850,
            extractedAt: new Date().toISOString()
          },
          entities: [
            { type: 'email', value: 'governance@company.com', confidence: 0.9 },
            { type: 'phone', value: '+1-555-0123', confidence: 0.8 },
            { type: 'person', value: 'Data Protection Officer', confidence: 0.7 },
            { type: 'organization', value: 'Data Governance Team', confidence: 0.8 }
          ],
          topics: ['enterprise', 'governance', 'synthetic data', 'compliance', 'data protection', 'policies', 'CI/CD', 'differential privacy', 'bias detection', 'audit logging', 'workflow integration'],
          isExpanded: false
        },
        {
          id: 'sample-2',
          fileName: 'data_governance_guidelines.docx',
          uploadDate: new Date(Date.now() - 86400000), // 1 day ago
          content: 'Our data governance framework establishes clear policies and procedures for managing enterprise data assets. This includes data classification, retention policies, access controls, and quality standards. All data handling activities must comply with industry regulations and internal policies, with regular monitoring and reporting to ensure adherence to established guidelines.',
          summary: 'Comprehensive data governance guidelines covering classification, retention, access controls, and quality standards.',
          metadata: {
            title: 'Data Governance Guidelines',
            author: 'IT Governance Team',
            pages: 12,
            wordCount: 2100,
            extractedAt: new Date(Date.now() - 86400000).toISOString()
          },
          entities: [
            { type: 'email', value: 'governance@company.com', confidence: 0.9 },
            { type: 'person', value: 'Chief Data Officer', confidence: 0.8 }
          ],
          topics: ['governance', 'data management', 'compliance', 'policies'],
          isExpanded: false
        }
      ];
      
      sampleDocuments.forEach(doc => {
        // Only add if not already present
        if (!extractedDocuments.find(d => d.id === doc.id)) {
          addDocument(doc);
        }
      });
    }
  }, [extractedDocuments.length, addDocument]);

  const handleExtractDocument = async (file: File) => {
    setIsExtracting(true);
    
    try {
      const result: LandingAIResponse = await landingAIService.extractDocumentContent(file);
      
      if (result.success && result.data) {
        const newDocument = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          uploadDate: new Date(),
          content: result.data.content,
          summary: result.data.summary,
          metadata: result.data.metadata,
          entities: result.data.entities || [],
          topics: result.data.topics || [],
          isExpanded: false
        };
        
        setExtractedDocuments(prev => [newDocument, ...prev]);
        toast.success('Document Extracted', `Content extracted from ${file.name}`);
      } else {
        toast.error('Extraction Failed', result.error || 'Failed to extract document content');
      }
    } catch (error) {
      console.error('Document extraction error:', error);
      toast.error('Extraction Failed', 'Failed to extract document content');
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleDocumentExpansion = (documentId: string) => {
    const document = extractedDocuments.find(doc => doc.id === documentId);
    if (document) {
      updateDocument(documentId, { isExpanded: !document.isExpanded });
    }
  };

  const handleEvaluateDocument = async (documentId: string) => {
    const document = extractedDocuments.find(d => d.id === documentId);
    if (!document) return;

    setIsEvaluating(true);
    
    const evaluationId = Math.random().toString(36).substr(2, 9);
    const newEvaluation = {
      id: evaluationId,
      fileName: document.fileName,
      qualityScore: 0,
      gdprCompliance: 0,
      dataIntegrity: 0,
      completeness: 0,
      accuracy: 0,
      timestamp: new Date(),
      status: 'evaluating' as const,
      issues: []
    };
    
    setEvaluationResults(prev => [newEvaluation, ...prev]);
    
    // Simulate evaluation progress
    const interval = setInterval(() => {
      setEvaluationResults(prev => 
        prev.map(evaluation => {
          if (evaluation.id === evaluationId) {
            const progress = Math.min(100, (evaluation.qualityScore || 0) + Math.random() * 15);
            const qualityScore = Math.round(progress);
            const gdprCompliance = Math.round(progress * 0.9 + Math.random() * 10);
            const dataIntegrity = Math.round(progress * 0.85 + Math.random() * 15);
            const completeness = Math.round(progress * 0.95 + Math.random() * 5);
            const accuracy = Math.round(progress * 0.88 + Math.random() * 12);
            
            if (progress >= 100) {
              clearInterval(interval);
              setIsEvaluating(false);
              
              toast.success('Evaluation Complete', 'Document evaluation completed successfully');
              
              // Generate mock issues
              const issues = [];
              if (qualityScore < 80) {
                issues.push({
                  type: 'warning' as const,
                  message: 'Data quality score is below recommended threshold',
                  severity: 'medium' as const
                });
              }
              if (gdprCompliance < 85) {
                issues.push({
                  type: 'error' as const,
                  message: 'GDPR compliance issues detected',
                  severity: 'high' as const
                });
              }
              if (completeness < 90) {
                issues.push({
                  type: 'warning' as const,
                  message: 'Data completeness could be improved',
                  severity: 'low' as const
                });
              }
              
              return {
                ...evaluation,
                qualityScore,
                gdprCompliance,
                dataIntegrity,
                completeness,
                accuracy,
                status: 'completed' as const,
                issues
              };
            }
            
            return {
              ...evaluation,
              qualityScore,
              gdprCompliance,
              dataIntegrity,
              completeness,
              accuracy
            };
          }
          return evaluation;
        })
      );
    }, 300);
  };

  const handleDeleteDocument = (documentId: string) => {
    const document = extractedDocuments.find(d => d.id === documentId);
    removeDocument(documentId);
    setEvaluationResults(prev => prev.filter(e => e.fileName !== document?.fileName));
    toast.success('Document Deleted', 'Document and its evaluations removed');
  };

  const handleDeleteEvaluation = (evaluationId: string) => {
    setEvaluationResults(prev => prev.filter(e => e.id !== evaluationId));
    toast.success('Evaluation Deleted', 'Evaluation result removed');
  };

  const getOverallStats = () => {
    const completedEvaluations = evaluationResults.filter(e => e.status === 'completed');
    if (completedEvaluations.length === 0) return null;

    const avgQuality = completedEvaluations.reduce((sum, e) => sum + e.qualityScore, 0) / completedEvaluations.length;
    const avgGDPR = completedEvaluations.reduce((sum, e) => sum + e.gdprCompliance, 0) / completedEvaluations.length;
    const totalIssues = completedEvaluations.reduce((sum, e) => sum + e.issues.length, 0);

    return {
      totalDocuments: extractedDocuments.length,
      evaluatedDocuments: completedEvaluations.length,
      avgQuality: Math.round(avgQuality),
      avgGDPR: Math.round(avgGDPR),
      totalIssues
    };
  };

  const stats = getOverallStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8 bg-white min-h-screen"
    >
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-semibold text-black">Data Evaluation</h1>
        <div className="flex items-center space-x-4">
          <button
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      
      {/* Overall Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
            </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Evaluated</p>
              <p className="text-2xl font-bold text-gray-900">{stats.evaluatedDocuments}</p>
            </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Quality</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgQuality}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIssues}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Extracted Documents Content Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <ScrollText className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Document Content Summary</h2>
          </div>
          
          {extractedDocuments.length === 0 ? (
            <div className="text-center py-8">
              <ScrollText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No documents extracted</h3>
              <p className="text-xs text-gray-500">Documents from Live Monitor will appear here after extraction</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {extractedDocuments.map((document) => (
                <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{document.fileName}</div>
                        <div className="text-xs text-gray-500">
                          {document.metadata.wordCount} words • {document.uploadDate.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEvaluateDocument(document.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Evaluate document"
                        disabled={isEvaluating}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleDocumentExpansion(document.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title={document.isExpanded ? "Collapse" : "Expand"}
                      >
                        {document.isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(document.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Summary:</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {document.summary}
                    </div>
                  </div>
                  
                  {/* Topics */}
                  {document.topics.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Topics:</div>
                      <div className="flex flex-wrap gap-1">
                        {document.topics.map((topic, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Entities */}
                  {document.entities.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Entities:</div>
                      <div className="flex flex-wrap gap-1">
                        {document.entities.slice(0, 5).map((entity, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {entity.type}: {entity.value}
                          </span>
                        ))}
                        {document.entities.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{document.entities.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Expanded Content */}
                  {document.isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">Full Content:</div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                        {document.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Evaluation Results</h2>
          </div>
          
          {evaluationResults.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No evaluations yet</h3>
              <p className="text-xs text-gray-500">Evaluate documents to see results here</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {evaluationResults.map((evaluation) => (
                <div key={evaluation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {evaluation.fileName}
                    </div>
                    <div className="flex items-center space-x-1">
                      {evaluation.status === 'evaluating' && (
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {evaluation.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {evaluation.status === 'error' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  {evaluation.status === 'completed' && (
                    <>
                      {/* Quality Score */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Quality Score</span>
                          <span className="font-medium">{evaluation.qualityScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              evaluation.qualityScore >= 80 ? 'bg-green-500' : 
                              evaluation.qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${evaluation.qualityScore}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">GDPR</span>
                          <span className="font-medium">{evaluation.gdprCompliance}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Integrity</span>
                          <span className="font-medium">{evaluation.dataIntegrity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Complete</span>
                          <span className="font-medium">{evaluation.completeness}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accuracy</span>
                          <span className="font-medium">{evaluation.accuracy}%</span>
                        </div>
                      </div>

                      {/* Issues */}
                      {evaluation.issues.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-2">Issues Found:</div>
                          <div className="space-y-1">
                            {evaluation.issues.map((issue, index) => (
                              <div key={index} className={`flex items-start space-x-2 text-xs ${
                                issue.type === 'error' ? 'text-red-600' : 
                                issue.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                              }`}>
                                {issue.type === 'error' && <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                {issue.type === 'warning' && <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                {issue.type === 'info' && <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                <span>{issue.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          {evaluation.timestamp.toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => handleDeleteEvaluation(evaluation.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
};

export default DataEvaluation;
