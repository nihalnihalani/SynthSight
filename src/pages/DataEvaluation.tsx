import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, FileText, Trash2, BarChart3, CheckCircle, AlertTriangle, RefreshCw, EyeOff, Upload, Shield, X, Brain, Zap, Users, Target, Settings } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { useDocumentContext, ExtractedDocument } from '../contexts/DocumentContext';
import { useDataContext, DataEvaluationResult as ContextDataEvaluationResult } from '../contexts/DataContext';
import { companyGuidelinesService, CompanyGuideline } from '../services/companyGuidelinesService';
import { perplexityService } from '../services/perplexityService';
import { ConsiliumEvaluationService, EvaluationRequest, ConsiliumEvaluationResult } from '../services/consiliumEvaluationService';
import ConsiliumEvaluationDashboard from '../components/ConsiliumEvaluationDashboard';
import IntelligentDashboard from '../components/IntelligentDashboard';
import AdvancedDashboard from '../components/AdvancedDashboard';
import Interactive3DDashboard from '../components/Interactive3DDashboard';
import CyberpunkDashboard from '../components/CyberpunkDashboard';

const DataEvaluation: React.FC = () => {
  const { extractedDocuments, addDocument } = useDocumentContext();
  const { 
    evaluationResults,
    addEvaluationResult,
    removeEvaluationResult
  } = useDataContext();
  const [isUploadingGuidelines, setIsUploadingGuidelines] = useState(false);
  const [isEvaluatingData, setIsEvaluatingData] = useState(false);
  const [isUploadingData, setIsUploadingData] = useState(false);
  const [enterpriseGuidelines, setEnterpriseGuidelines] = useState<CompanyGuideline[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardType, setDashboardType] = useState<'basic' | 'advanced' | '3d' | 'cyberpunk'>('basic');
  const [dragActive, setDragActive] = useState(false);
  
  // Consilium Multi-LLM Evaluation State
  const [consiliumEvaluationService] = useState(() => new ConsiliumEvaluationService());
  const [consiliumEvaluationResult, setConsiliumEvaluationResult] = useState<ConsiliumEvaluationResult | null>(null);
  const [showConsiliumDashboard, setShowConsiliumDashboard] = useState(false);
  const [isConsiliumEvaluating, setIsConsiliumEvaluating] = useState(false);
  const [evaluationMode, setEvaluationMode] = useState<'traditional' | 'consilium'>('traditional');
  const [uploadedDataFiles, setUploadedDataFiles] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: Date;
    content: any;
    preview?: string;
  }>>([]);
  const [selectedDataFile, setSelectedDataFile] = useState<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: Date;
    content: any;
    preview?: string;
  } | null>(null);
  const toast = useToast();

  // Documents are now managed by the DocumentContext
  // Add some sample documents for demonstration
  useEffect(() => {
    if (extractedDocuments.length === 0) {
      // Add sample documents for demonstration
      const sampleDocuments: ExtractedDocument[] = [
        {
          id: 'sample-1',
          fileName: 'Sample Enterprise Guidelines.pdf',
          uploadDate: new Date(),
          content: 'This is a sample enterprise guidelines document...',
          summary: 'Sample enterprise guidelines for data governance and compliance.',
          metadata: {
            title: 'Sample Enterprise Guidelines',
            author: 'Sample Author',
            pages: 10,
            wordCount: 5000,
            extractedAt: new Date().toISOString()
          },
          entities: [
            { type: 'ORGANIZATION', value: 'Sample Corp', confidence: 0.95 },
            { type: 'PERSON', value: 'John Doe', confidence: 0.88 }
          ],
          topics: ['data governance', 'compliance', 'enterprise'],
          isExpanded: false
        }
      ];
      
      sampleDocuments.forEach(doc => addDocument(doc));
    }
  }, [extractedDocuments.length, addDocument]);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };


  const handleDeleteEvaluation = (evaluationId: string) => {
    removeEvaluationResult(evaluationId);
    toast.info('Evaluation Deleted', 'Evaluation result removed');
  };

  const handleGuidelinesUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    setIsUploadingGuidelines(true);
    toast.info('Processing Guidelines', 'Extracting content and generating summary...');
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const guideline = await companyGuidelinesService.processCompanyGuidelines(file);
        setEnterpriseGuidelines(prev => [guideline, ...prev]);
      }
      
      toast.success('Guidelines Processed', 'Enterprise guidelines uploaded and processed successfully');
    } catch (error) {
      console.error('Error processing guidelines:', error);
      toast.error('Processing Failed', 'Failed to process enterprise guidelines');
    } finally {
      setIsUploadingGuidelines(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleGuidelinesUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleGuidelinesUpload(e.target.files);
    }
  };

  const handleDataFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploadingData(true);
    toast.info('Processing Data Files', 'Uploading and processing data files...');
    
    try {
      const newFiles: Array<{
        id: string;
        name: string;
        type: string;
        size: number;
        uploadDate: Date;
        content: any;
        preview?: string;
      }> = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await readFileAsText(file);
        
        const dataFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          uploadDate: new Date(),
          content: content,
          preview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
        };
        
        newFiles.push(dataFile);
      }
      
      setUploadedDataFiles(prev => [...newFiles, ...prev]);
      
      if (newFiles.length === 1) {
        setSelectedDataFile(newFiles[0]);
      }
      
      toast.success('Data Files Uploaded', `${newFiles.length} data file(s) uploaded successfully`);
    } catch (error) {
      console.error('Error processing data files:', error);
      toast.error('Upload Failed', 'Failed to process data files');
    } finally {
      setIsUploadingData(false);
    }
  };

  const handleDeleteDataFile = (fileId: string) => {
    setUploadedDataFiles(prev => prev.filter(file => file.id !== fileId));
    if (selectedDataFile?.id === fileId) {
      setSelectedDataFile(null);
    }
    toast.info('File Deleted', 'Data file removed');
  };

  const handleEvaluateDatasetAgainstGuidelines = async (guidelineId: string) => {
    console.log('Evaluation triggered with guidelineId:', guidelineId);
    console.log('Selected data file:', selectedDataFile);
    
    if (!selectedDataFile) {
      toast.error('No Data File Selected', 'Please upload and select a data file first');
      return;
    }

    if (evaluationMode === 'consilium') {
      await handleConsiliumEvaluation(guidelineId);
      return;
    }

    setIsEvaluatingData(true);
    
    try {
      toast.info('Starting Evaluation', 'Analyzing dataset against enterprise guidelines and GDPR...');

      // Get GDPR analysis using Perplexity API
      let gdprAnalysis = null;
      try {
        const datasetContent = selectedDataFile.content;
        gdprAnalysis = await perplexityService.analyzeGDPRCompliance(datasetContent);
      } catch (error) {
        console.warn('GDPR analysis failed, using default:', error);
        gdprAnalysis = {
          overallComplianceScore: 85,
          violations: [],
          summary: 'GDPR analysis not available'
        };
      }

      // Comprehensive evaluation using the new method
      const evaluationResult = await companyGuidelinesService.evaluateDatasetAgainstGuidelines(
        selectedDataFile.content,
        guidelineId,
        gdprAnalysis
      );

      // Create evaluation result for context
      const contextResult: ContextDataEvaluationResult = {
        id: Math.random().toString(36).substr(2, 9),
        datasetId: selectedDataFile.id,
        guidelineId: guidelineId,
        timestamp: new Date(),
        overallComplianceScore: evaluationResult.overallComplianceScore,
        gdprComplianceScore: evaluationResult.gdprComplianceScore,
        enterpriseComplianceScore: evaluationResult.enterpriseComplianceScore,
        dataQualityScore: evaluationResult.dataQualityScore,
        anomalies: evaluationResult.anomalies,
        violations: evaluationResult.violations,
        recommendations: evaluationResult.recommendations,
        status: 'completed',
        riskLevel: evaluationResult.riskLevel,
        fileName: selectedDataFile.name
      };

      addEvaluationResult(contextResult);
      setShowDashboard(true);
      
      toast.success('Evaluation Complete', `Dataset evaluated with ${evaluationResult.overallComplianceScore}% compliance score`);
      
      if (evaluationResult.riskLevel === 'critical' || evaluationResult.riskLevel === 'high') {
        toast.warning('High Risk Detected', `${evaluationResult.violations.length} violations and ${evaluationResult.anomalies.length} anomalies found`);
      }
    } catch (error) {
      console.error('Error evaluating data:', error);
      toast.error('Evaluation Failed', 'Failed to evaluate data against enterprise guidelines');
    } finally {
      setIsEvaluatingData(false);
    }
  };

  const handleConsiliumEvaluation = async (guidelineId: string) => {
    if (!selectedDataFile) {
      toast.error('No Data File Selected', 'Please upload and select a data file first');
      return;
    }

    setIsConsiliumEvaluating(true);
    
    try {
      toast.info('Starting Consilium Multi-LLM Evaluation', 'Running comprehensive AI evaluation with research integration...');

      // Parse the data file content
      let originalData: any[] = [];
      try {
        if (selectedDataFile.name.endsWith('.csv')) {
          const lines = selectedDataFile.content.split('\n');
          const headers = lines[0].split(',');
          originalData = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header.trim()] = values[index]?.trim() || '';
            });
            return obj;
          }).filter(obj => Object.values(obj).some(val => val !== ''));
        } else if (selectedDataFile.name.endsWith('.json')) {
          originalData = JSON.parse(selectedDataFile.content);
        } else {
          // For other formats, create a simple structure
          originalData = [{ content: selectedDataFile.content }];
        }
      } catch (error) {
        console.error('Error parsing data:', error);
        originalData = [{ content: selectedDataFile.content }];
      }

      // Create evaluation request
      const evaluationRequest: EvaluationRequest = {
        originalData: originalData,
        syntheticData: originalData, // For now, evaluating against itself
        domainContext: 'data evaluation',
        useCase: 'compliance assessment',
        privacyRequirements: {
          level: 'high',
          regulations: ['GDPR', 'CCPA']
        },
        qualityThresholds: {
          minimumScore: 70,
          requiredAgreement: 0.6
        }
      };

      // Run Consilium evaluation
      const consiliumResult = await consiliumEvaluationService.evaluateSyntheticData(evaluationRequest);
      
      setConsiliumEvaluationResult(consiliumResult);
      setShowConsiliumDashboard(true);
      
      toast.success('Consilium Evaluation Complete', 
        `Multi-LLM consensus: ${consiliumResult.consensusScore}/100 (${consiliumResult.agreementLevel} agreement)`);
      
      if (consiliumResult.finalRecommendation.riskAssessment === 'critical' || 
          consiliumResult.finalRecommendation.riskAssessment === 'high') {
        toast.warning('High Risk Detected', 
          `Risk Level: ${consiliumResult.finalRecommendation.riskAssessment.toUpperCase()}`);
      }
      
    } catch (error) {
      console.error('Error in Consilium evaluation:', error);
      toast.error('Consilium Evaluation Failed', 'Failed to run multi-LLM evaluation');
    } finally {
      setIsConsiliumEvaluating(false);
    }
  };

  const getOverallStats = () => {
    const completedEvaluations = evaluationResults.filter(e => e.status === 'completed');
    const totalEvaluations = evaluationResults.length;
    const averageScore = completedEvaluations.length > 0 
      ? Math.round(completedEvaluations.reduce((sum, e) => sum + e.overallComplianceScore, 0) / completedEvaluations.length)
      : 0;
    
    return {
      totalEvaluations,
      completedEvaluations: completedEvaluations.length,
      averageScore,
      highRiskCount: completedEvaluations.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length
    };
  };

  const stats = getOverallStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-6"
    >
      <ToastContainer toasts={[]} onRemove={() => {}} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Evaluation</h1>
            <p className="text-gray-600">Upload and evaluate data against enterprise guidelines and GDPR compliance</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Evaluation Mode Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Evaluation Mode:</label>
            <select
              value={evaluationMode}
              onChange={(e) => setEvaluationMode(e.target.value as 'traditional' | 'consilium')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="traditional">Traditional</option>
              <option value="consilium">Consilium Multi-LLM</option>
            </select>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Evaluations</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalEvaluations}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Average Score</div>
            <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
          </div>
        </div>
      </div>

      {/* Data Upload for Evaluation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <FileText className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Upload Data for Evaluation</h2>
        </div>
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".csv,.json,.xlsx,.xls,.txt"
            onChange={handleDataFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              {dragActive ? 'Drop your data files here' : 'Click to upload data files for evaluation'}
            </div>
            <div className="text-sm text-gray-500">
              CSV, JSON, Excel, or TXT files (max 10MB each)
            </div>
            {isUploadingData && (
              <div className="mt-4">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Processing data files...</p>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Data Files List */}
        {uploadedDataFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Uploaded Data Files</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {uploadedDataFiles.map((file) => (
                <div 
                  key={file.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedDataFile?.id === file.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    console.log('Selecting data file:', file);
                    setSelectedDataFile(file);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {file.type} • {file.size} bytes • {file.uploadDate.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedDataFile?.id === file.id && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDataFile(file.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {file.preview && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2">
                      <div className="font-medium mb-1">Preview:</div>
                      <div className="max-h-20 overflow-y-auto">
                        {file.preview}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Evaluation Button */}
            {selectedDataFile && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-green-800">
                      Ready to Evaluate
                    </div>
                    <div className="text-xs text-green-600">
                      Selected: {selectedDataFile.name} • Mode: {evaluationMode === 'consilium' ? 'Consilium Multi-LLM' : 'Traditional'}
                      {evaluationMode === 'traditional' && enterpriseGuidelines.length > 0 && ` • ${enterpriseGuidelines.length} guideline(s) available`}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {evaluationMode === 'consilium' && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <Brain className="w-4 h-4" />
                        <span>Multi-LLM</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleEvaluateDatasetAgainstGuidelines(
                        evaluationMode === 'traditional' && enterpriseGuidelines.length > 0 
                          ? enterpriseGuidelines[0].id 
                          : 'consilium-evaluation'
                      )}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isEvaluatingData || isConsiliumEvaluating || (evaluationMode === 'traditional' && enterpriseGuidelines.length === 0)}
                    >
                      {isEvaluatingData || isConsiliumEvaluating ? 'Evaluating...' : 'Start Evaluation'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enterprise Guidelines Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Enterprise Guidelines Upload</h2>
        </div>
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv,.json"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              {dragActive ? 'Drop your enterprise guidelines here' : 'Click to upload enterprise guidelines'}
            </div>
            <div className="text-sm text-gray-500">
              PDF, DOC, DOCX, TXT, CSV, or JSON files (max 10MB each)
            </div>
            {isUploadingGuidelines && (
              <div className="mt-4">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Processing guidelines...</p>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Guidelines List */}
        {enterpriseGuidelines.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Uploaded Guidelines</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {enterpriseGuidelines.map((guideline) => (
                <div key={guideline.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{guideline.name}</div>
                        <div className="text-xs text-gray-500">
                          Enterprise Guidelines • {guideline.rules.length} rules • {guideline.uploadDate.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEvaluateDatasetAgainstGuidelines(guideline.id)}
                        className={`p-2 transition-colors ${
                          isEvaluatingData || !selectedDataFile
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-green-600 hover:text-green-800 hover:bg-green-50 rounded'
                        }`}
                        title={
                          !selectedDataFile 
                            ? 'Please select a data file first'
                            : 'Evaluate selected dataset against this guideline'
                        }
                        disabled={isEvaluatingData || !selectedDataFile}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      {selectedDataFile && (
                        <span className="text-xs text-green-600 font-medium">
                          Ready to evaluate
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <div className="font-medium mb-1">Content Preview:</div>
                    <div className="max-h-20 overflow-y-auto">
                      {guideline.content.substring(0, 200)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Intelligent Data Evaluation Dashboard */}
      {showDashboard && evaluationResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Intelligent Data Evaluation Dashboard</h2>
            <button
              onClick={() => setShowDashboard(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeOff className="h-5 w-5" />
            </button>
          </div>
          
          <IntelligentDashboard evaluationResults={evaluationResults as any} isLoading={isEvaluatingData} />
        </div>
      )}

      {/* Evaluation Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Evaluation Results</h2>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{stats.completedEvaluations} completed</span>
          </div>
        </div>
        
        {evaluationResults.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No evaluations yet</h3>
            <p className="text-xs text-gray-500">Upload data files and guidelines to start evaluating</p>
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
                    {/* Overall Compliance Score */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Overall Compliance</span>
                        <span className="font-medium">{evaluation.overallComplianceScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            evaluation.overallComplianceScore >= 80 ? 'bg-green-500' : 
                            evaluation.overallComplianceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${evaluation.overallComplianceScore}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">GDPR</span>
                        <span className="font-medium">{evaluation.gdprComplianceScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Enterprise</span>
                        <span className="font-medium">{evaluation.enterpriseComplianceScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quality</span>
                        <span className="font-medium">{evaluation.dataQualityScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Risk</span>
                        <span className={`font-medium ${
                          evaluation.riskLevel === 'critical' ? 'text-red-600' :
                          evaluation.riskLevel === 'high' ? 'text-orange-600' :
                          evaluation.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {evaluation.riskLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Violations and Anomalies */}
                    {(evaluation.violations.length > 0 || evaluation.anomalies.length > 0) && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Issues Found:</div>
                        <div className="space-y-1">
                          {evaluation.violations.map((violation, index) => (
                            <div key={`violation-${index}`} className={`flex items-start space-x-2 text-xs ${
                              violation.severity === 'critical' ? 'text-red-600' : 
                              violation.severity === 'high' ? 'text-orange-600' : 
                              violation.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                            }`}>
                              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{violation.description}</span>
                            </div>
                          ))}
                          {evaluation.anomalies.map((anomaly, index) => (
                            <div key={`anomaly-${index}`} className={`flex items-start space-x-2 text-xs ${
                              anomaly.severity === 'critical' ? 'text-red-600' : 
                              anomaly.severity === 'high' ? 'text-orange-600' : 
                              anomaly.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                            }`}>
                              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{anomaly.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {evaluation.recommendations.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Recommendations:</div>
                        <div className="space-y-1">
                          {evaluation.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start space-x-2 text-xs text-blue-600">
                              <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{recommendation}</span>
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

        {/* Evaluation Results Dashboard */}
        {showDashboard && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Evaluation Results</h2>
              <div className="flex items-center space-x-4">
                {/* Dashboard Type Selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Dashboard:</label>
                  <select
                    value={dashboardType}
                    onChange={(e) => setDashboardType(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                    <option value="3d">3D Interactive</option>
                    <option value="cyberpunk">Cyberpunk</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowDashboard(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="min-h-96">
              {dashboardType === 'basic' && (
                <IntelligentDashboard 
                  evaluationResults={evaluationResults as any} 
                  isLoading={isEvaluatingData}
                />
              )}
              {dashboardType === 'advanced' && (
                <AdvancedDashboard 
                  evaluationResults={evaluationResults as any} 
                  isLoading={isEvaluatingData}
                />
              )}
              {dashboardType === '3d' && (
                <Interactive3DDashboard 
                  evaluationResults={evaluationResults as any} 
                  isLoading={isEvaluatingData}
                />
              )}
              {dashboardType === 'cyberpunk' && (
                <CyberpunkDashboard 
                  evaluationResults={evaluationResults as any} 
                  isLoading={isEvaluatingData}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Consilium Multi-LLM Evaluation Dashboard */}
      {showConsiliumDashboard && consiliumEvaluationResult && (
        <ConsiliumEvaluationDashboard
          evaluationResult={consiliumEvaluationResult}
          onClose={() => setShowConsiliumDashboard(false)}
          onRetry={() => {
            if (selectedDataFile && enterpriseGuidelines.length > 0) {
              handleConsiliumEvaluation(enterpriseGuidelines[0].id);
            }
          }}
        />
      )}
    </motion.div>
  );
};

export default DataEvaluation;