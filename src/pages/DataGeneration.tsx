import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, FileText, RefreshCw, Settings, Play, Pause, Square, BarChart3, CheckCircle, AlertTriangle, TrendingUp, Upload, FileUp, BarChart, Shield, Zap, Brain, Target } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import DocumentUpload from '../components/DocumentUpload';
import { DocumentUpload as DocumentUploadType, AnalysisType } from '../types';

const DataGeneration: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [inputMode, setInputMode] = useState<'text' | 'metadata' | 'enterprise'>('text');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [syntheticData, setSyntheticData] = useState<any[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [generatedFiles, setGeneratedFiles] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    timestamp: Date;
    status: 'generating' | 'completed' | 'error';
    qualityScore?: number;
    privacyLevel?: number;
    modelType?: string;
  }>>([]);
  
  const [generationSettings, setGenerationSettings] = useState({
    dataType: 'synthetic',
    recordCount: 1000,
    includePII: false,
    gdprCompliant: true,
    dataFormat: 'csv',
    modelType: 'ctgan',
    privacyLevel: 0.5,
    epochs: 300
  });
  
  const toast = useToast();

  const dataTypes = [
    { id: 'synthetic', name: 'Synthetic Data', description: 'Generate artificial data for testing' },
    { id: 'metadata', name: 'Metadata', description: 'Generate metadata for compliance testing' },
    { id: 'logs', name: 'Audit Logs', description: 'Generate audit log entries' },
    { id: 'interactions', name: 'LLM Interactions', description: 'Generate sample LLM interactions' }
  ];

  const dataFormats = [
    { id: 'csv', name: 'CSV', description: 'Comma-separated values' },
    { id: 'json', name: 'JSON', description: 'JavaScript Object Notation' },
    { id: 'xml', name: 'XML', description: 'Extensible Markup Language' },
    { id: 'parquet', name: 'Parquet', description: 'Columnar storage format' }
  ];

  const syntheticModels = [
    { 
      id: 'ctgan', 
      name: 'CTGAN', 
      description: 'Conditional Tabular Generative Adversarial Network',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: ['High quality', 'Complex relationships', 'Deep learning']
    },
    { 
      id: 'copulagan', 
      name: 'CopulaGAN', 
      description: 'Copula-based Generative Adversarial Network',
      icon: BarChart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      features: ['Statistical modeling', 'Fast training', 'Good for tabular data']
    },
    { 
      id: 'tvae', 
      name: 'TVAE', 
      description: 'Tabular Variational Autoencoder',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: ['Variational inference', 'Stable training', 'Good privacy']
    },
    { 
      id: 'gaussiancopula', 
      name: 'Gaussian Copula', 
      description: 'Gaussian Copula Synthesizer',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      features: ['Fast generation', 'Simple model', 'Good baseline']
    }
  ];

  const supportedFileTypes = [
    { extension: '.csv', name: 'CSV', icon: FileText },
    { extension: '.xlsx', name: 'Excel', icon: FileText },
    { extension: '.json', name: 'JSON', icon: FileText },
    { extension: '.txt', name: 'Text', icon: FileText },
    { extension: '.pdf', name: 'PDF', icon: FileText }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success('File Uploaded', `${file.name} uploaded successfully`);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      toast.success('File Uploaded', `${file.name} uploaded successfully`);
    }
  };

  const simulateSyntheticGeneration = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const newFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: `synthetic_data_${generationSettings.modelType}_${new Date().toISOString().split('T')[0]}.${generationSettings.dataFormat}`,
      type: generationSettings.dataFormat.toUpperCase(),
      size: '0 KB',
      timestamp: new Date(),
      status: 'generating' as const,
      modelType: generationSettings.modelType,
      privacyLevel: generationSettings.privacyLevel
    };
    
    setGeneratedFiles(prev => [newFile, ...prev]);
    
    // Simulate synthetic data generation with realistic progress
    const totalSteps = 5;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / totalSteps) * 100;
      setGenerationProgress(progress);
      
      if (currentStep === 1) {
        toast.info('Processing Data', 'Analyzing uploaded data structure...');
      } else if (currentStep === 2) {
        toast.info('Training Model', `Training ${generationSettings.modelType.toUpperCase()} model...`);
      } else if (currentStep === 3) {
        toast.info('Generating Data', 'Creating synthetic samples...');
      } else if (currentStep === 4) {
        toast.info('Evaluating Quality', 'Running quality assessment...');
      } else if (currentStep === 5) {
        clearInterval(interval);
        setIsGenerating(false);
        
        // Generate mock synthetic data
        const mockData = Array.from({ length: generationSettings.recordCount }, (_, i) => ({
          id: i + 1,
          name: `Synthetic User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          age: Math.floor(Math.random() * 50) + 18,
          income: Math.floor(Math.random() * 100000) + 30000,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)]
        }));
        
        setSyntheticData(mockData);
        
        // Mock quality metrics
        const mockQualityMetrics = {
          qualityScore: 0.85 + Math.random() * 0.1,
          privacyScore: generationSettings.privacyLevel,
          statisticalSimilarity: 0.78 + Math.random() * 0.15,
          dataCoverage: 0.92 + Math.random() * 0.05
        };
        setQualityMetrics(mockQualityMetrics);
        
        setGeneratedFiles(prevFiles => 
          prevFiles.map(file => 
            file.id === newFile.id 
              ? { 
                  ...file, 
                  status: 'completed', 
                  size: `${Math.floor(Math.random() * 500) + 100} KB`,
                  qualityScore: mockQualityMetrics.qualityScore
                }
              : file
          )
        );
        
        toast.success('Generation Complete', `Generated ${generationSettings.recordCount} synthetic rows with ${generationSettings.modelType.toUpperCase()}`);
      }
    }, 1000);
  };

  const handleStartGeneration = async () => {
    if (!uploadedFile) {
      toast.error('No File Uploaded', 'Please upload a data file before generating synthetic data');
      return;
    }
    
    await simulateSyntheticGeneration();
  };

  const handleStopGeneration = () => {
    setIsGenerating(false);
    setGenerationProgress(0);
    toast.warning('Generation Stopped', 'Data generation was cancelled');
  };

  const handleDownloadFile = (fileId: string) => {
    const file = generatedFiles.find(f => f.id === fileId);
    if (file) {
      // In a real implementation, this would trigger an actual download
      toast.success('Download Started', `Downloading ${file.name}`);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setGeneratedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('File Deleted', 'Generated file removed');
  };

  const handleDocumentSubmit = async (document: DocumentUploadType, analysisType: AnalysisType) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Show processing toast
      toast.info('Processing Document', 'Extracting content and generating data...');
      
      const newFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${document.fileName}_generated_${new Date().toISOString().split('T')[0]}.${generationSettings.dataFormat}`,
        type: generationSettings.dataFormat.toUpperCase(),
        size: '0 KB',
        timestamp: new Date(),
        status: 'generating' as const
      };
      
      setGeneratedFiles(prev => [newFile, ...prev]);
      
      // Simulate generation progress
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsGenerating(false);
            setGeneratedFiles(prevFiles => 
              prevFiles.map(file => 
                file.id === newFile.id 
                  ? { ...file, status: 'completed', size: `${Math.floor(Math.random() * 500) + 100} KB` }
                  : file
              )
            );
            toast.success('Generation Complete', 'Data file generated from document successfully');
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 200);
      
    } catch (error) {
      console.error('Error processing document:', error);
      toast.error('Processing Failed', error instanceof Error ? error.message : 'Unknown error');
      setIsGenerating(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8 bg-white min-h-screen"
    >
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-semibold text-black">Data Generation</h1>
        <div className="flex items-center space-x-4">
          {/* Input Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                inputMode === 'text'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={isGenerating}
            >
              <FileText className="h-4 w-4" />
              <span>Text Prompt</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('metadata')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                inputMode === 'metadata'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={isGenerating}
            >
              <Upload className="h-4 w-4" />
              <span>Metadata Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('enterprise')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                inputMode === 'enterprise'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={isGenerating}
            >
              <Upload className="h-4 w-4" />
              <span>Enterprise Guidelines Upload</span>
            </button>
          </div>
          
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
      
      {/* Advanced Synthetic Data Generator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">🔬 Synthetic Data Generator</h3>
        </div>
        <p className="text-gray-600 mb-6">Generate high-quality synthetic data using advanced machine learning models</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Data Input Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Data Input</h4>
            <p className="text-sm text-gray-600 mb-4">Upload your data file to get started (CSV, Excel, or other supported formats)</p>
            
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : uploadedFile 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".csv,.xlsx,.json,.txt,.pdf"
                className="hidden"
              />
              
              {uploadedFile ? (
                <div className="space-y-3">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-green-800">{uploadedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileUp className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Upload File
                    </button>
                    <p className="text-sm text-gray-500 mt-1">or drag and drop file here</p>
                  </div>
                  <p className="text-xs text-gray-400">Limit 200MB per file</p>
                </div>
              )}
            </div>
            
            {/* Supported File Types */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Supported formats:</p>
              <div className="flex flex-wrap gap-2">
                {supportedFileTypes.map((type) => (
                  <span key={type.extension} className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs">
                    <type.icon className="h-3 w-3" />
                    <span>{type.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Settings Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Settings</h4>
            <p className="text-sm text-gray-600 mb-4">Configure your synthetic data generation</p>
            
            <div className="space-y-6">
              {/* Number of synthetic rows */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of synthetic rows
                </label>
                <input
                  type="number"
                  min="100"
                  max="100000"
                  value={generationSettings.recordCount}
                  onChange={(e) => setGenerationSettings(prev => ({ ...prev, recordCount: parseInt(e.target.value) }))}
                  disabled={isGenerating}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Model type selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Model type</label>
                <div className="grid grid-cols-1 gap-3">
                  {syntheticModels.map((model) => (
                    <label key={model.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="modelType"
                        value={model.id}
                        checked={generationSettings.modelType === model.id}
                        onChange={(e) => setGenerationSettings(prev => ({ ...prev, modelType: e.target.value }))}
                        className="mt-1 text-blue-600"
                        disabled={isGenerating}
                      />
                      <div className={`p-2 rounded-lg ${model.bgColor}`}>
                        <model.icon className={`h-5 w-5 ${model.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                        <div className="text-xs text-gray-500 mb-1">{model.description}</div>
                        <div className="flex flex-wrap gap-1">
                          {model.features.map((feature, idx) => (
                            <span key={idx} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Privacy level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy level: {generationSettings.privacyLevel.toFixed(2)}
                </label>
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={generationSettings.privacyLevel}
                    onChange={(e) => setGenerationSettings(prev => ({ ...prev, privacyLevel: parseFloat(e.target.value) }))}
                    disabled={isGenerating}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 w-16">
                    {generationSettings.privacyLevel < 0.3 ? 'Low' : 
                     generationSettings.privacyLevel < 0.7 ? 'Medium' : 'High'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.00 (Full fidelity)</span>
                  <span>1.00 (Maximum privacy)</span>
                </div>
              </div>
              
              {/* Generate button */}
              <div className="pt-4">
                {!isGenerating ? (
                  <motion.button
                    onClick={handleStartGeneration}
                    disabled={!uploadedFile}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Brain className="h-5 w-5" />
                    <span>Generate Synthetic Data</span>
                  </motion.button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Generating synthetic data...</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                    <button
                      onClick={handleStopGeneration}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Square className="h-4 w-4" />
                      <span>Stop Generation</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900">Results</h3>
        </div>
        
        {syntheticData.length > 0 ? (
          <div className="space-y-6">
            {/* Quality Metrics */}
            {qualityMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Quality Score</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {(qualityMetrics.qualityScore * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Privacy Score</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {(qualityMetrics.privacyScore * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Statistical Similarity</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {(qualityMetrics.statisticalSimilarity * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Data Coverage</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {(qualityMetrics.dataCoverage * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            )}
            
            {/* Generated Data Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Generated Synthetic Data ({syntheticData.length} rows)
                </h4>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download CSV</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Download JSON</span>
                  </motion.button>
                </div>
              </div>
              
              {/* Data Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(syntheticData[0] || {}).map((key) => (
                          <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {syntheticData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {syntheticData.length > 10 && (
                  <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500 text-center">
                    Showing first 10 rows of {syntheticData.length} total rows
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No synthetic data generated yet</h3>
            <p className="text-gray-500">Upload a data file and configure settings to generate synthetic data.</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Settings */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Generation Settings</h2>
            </div>
            
            <div className="space-y-6">
              {/* Data Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Data Type</label>
                <div className="space-y-2">
                  {dataTypes.map((type) => (
                    <label key={type.id} className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="dataType"
                        value={type.id}
                        checked={generationSettings.dataType === type.id}
                        onChange={(e) => setGenerationSettings(prev => ({ ...prev, dataType: e.target.value }))}
                        className="mt-1 text-blue-600"
                        disabled={isGenerating}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{type.name}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Record Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Record Count: {generationSettings.recordCount.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={generationSettings.recordCount}
                  onChange={(e) => setGenerationSettings(prev => ({ ...prev, recordCount: parseInt(e.target.value) }))}
                  disabled={isGenerating}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100</span>
                  <span>10,000</span>
                </div>
              </div>

              {/* Data Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Data Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {dataFormats.map((format) => (
                    <label key={format.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="dataFormat"
                        value={format.id}
                        checked={generationSettings.dataFormat === format.id}
                        onChange={(e) => setGenerationSettings(prev => ({ ...prev, dataFormat: e.target.value }))}
                        className="text-blue-600"
                        disabled={isGenerating}
                      />
                      <span className="text-sm font-medium text-gray-900">{format.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generationSettings.includePII}
                    onChange={(e) => setGenerationSettings(prev => ({ ...prev, includePII: e.target.checked }))}
                    disabled={isGenerating}
                    className="text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Include PII data</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generationSettings.gdprCompliant}
                    onChange={(e) => setGenerationSettings(prev => ({ ...prev, gdprCompliant: e.target.checked }))}
                    disabled={isGenerating}
                    className="text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">GDPR compliant</span>
                </label>
              </div>

              {/* Generation Controls */}
              <div className="pt-4 border-t border-gray-200">
                {!isGenerating ? (
                  <button
                    onClick={handleStartGeneration}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Generation</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Generating...</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                    <button
                      onClick={handleStopGeneration}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Square className="h-4 w-4" />
                      <span>Stop Generation</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Generated Files */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Database className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Generated Files</h2>
            </div>
            
            {generatedFiles.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files generated yet</h3>
                <p className="text-gray-500">Configure your settings and start generating data files.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {generatedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {file.type} • {file.size} • {file.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.status === 'generating' && (
                        <div className="flex items-center space-x-2 text-blue-600">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Generating...</span>
                        </div>
                      )}
                      {file.status === 'completed' && (
                        <>
                          <button
                            onClick={() => handleDownloadFile(file.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete file"
                          >
                            <Square className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {file.status === 'error' && (
                        <span className="text-sm text-red-600">Error</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default DataGeneration;
