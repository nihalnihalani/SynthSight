import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, FileText, RefreshCw, Settings, Play, Pause, Square, BarChart3, CheckCircle, AlertTriangle, TrendingUp, Upload, FileUp, BarChart, Shield, Zap, Brain, Target, Activity, Eye, Lock, Users, BarChart4, PieChart, LineChart, ScatterChart } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import DocumentUpload from '../components/DocumentUpload';
import { DocumentUpload as DocumentUploadType, AnalysisType } from '../types';
import { SyntheticDataService, DataAnalysisResult, SyntheticDataRequest } from '../services/syntheticDataService';

// Real calculation functions for synthetic data analysis
const calculateDistributionSimilarity = (original: DataAnalysisResult, synthetic: DataAnalysisResult): number => {
  const originalStats = original.statistics;
  const syntheticStats = synthetic.statistics;
  
  let totalSimilarity = 0;
  let featureCount = 0;
  
  Object.keys(originalStats).forEach(feature => {
    if (original.dataTypes[feature] === 'numeric' && syntheticStats[feature]) {
      const origMean = originalStats[feature].mean;
      const synthMean = syntheticStats[feature].mean;
      const origStd = originalStats[feature].std;
      const synthStd = syntheticStats[feature].std;
      
      // Calculate similarity based on mean and std deviation
      const meanSimilarity = 1 - Math.abs(origMean - synthMean) / Math.max(origMean, synthMean);
      const stdSimilarity = 1 - Math.abs(origStd - synthStd) / Math.max(origStd, synthStd);
      
      totalSimilarity += (meanSimilarity + stdSimilarity) / 2;
      featureCount++;
    }
  });
  
  return featureCount > 0 ? (totalSimilarity / featureCount) * 100 : 85;
};

const calculateDriftIndex = (original: DataAnalysisResult, synthetic: DataAnalysisResult): number => {
  let totalDrift = 0;
  let featureCount = 0;
  
  Object.keys(original.statistics).forEach(feature => {
    if (original.dataTypes[feature] === 'numeric') {
      const origMean = original.statistics[feature].mean;
      const synthMean = synthetic.statistics[feature]?.mean || origMean;
      const origStd = original.statistics[feature].std;
      
      // Calculate drift as normalized difference
      const drift = Math.abs(origMean - synthMean) / origStd;
      totalDrift += drift;
      featureCount++;
    }
  });
  
  return featureCount > 0 ? totalDrift / featureCount : 0.1;
};

const calculatePrivacyRisk = (syntheticData: any[], privacyLevel: number): number => {
  // Calculate privacy risk based on data characteristics and privacy level
  const uniqueValues = new Set();
  syntheticData.forEach(record => {
    Object.values(record).forEach(value => uniqueValues.add(value));
  });
  
  const uniquenessRatio = uniqueValues.size / (syntheticData.length * Object.keys(syntheticData[0] || {}).length);
  const baseRisk = uniquenessRatio * 100;
  
  // Adjust based on privacy level (higher privacy level = lower risk)
  return Math.max(0, Math.min(100, baseRisk - (privacyLevel * 20)));
};

const calculateModelUtility = (original: DataAnalysisResult, synthetic: DataAnalysisResult): number => {
  // Calculate utility based on how well synthetic data preserves original patterns
  const distributionSimilarity = calculateDistributionSimilarity(original, synthetic) / 100;
  const correlationPreservation = calculateCorrelationPreservation(original, synthetic);
  
  return (distributionSimilarity * 0.6 + correlationPreservation * 0.4) * 100;
};

const calculateCorrelationPreservation = (original: DataAnalysisResult, synthetic: DataAnalysisResult): number => {
  let totalPreservation = 0;
  let correlationCount = 0;
  
  Object.keys(original.correlations).forEach(feature1 => {
    Object.keys(original.correlations[feature1]).forEach(feature2 => {
      if (feature1 !== feature2) {
        const origCorr = original.correlations[feature1][feature2];
        const synthCorr = synthetic.correlations[feature1]?.[feature2] || 0;
        
        const preservation = 1 - Math.abs(origCorr - synthCorr);
        totalPreservation += preservation;
        correlationCount++;
      }
    });
  });
  
  return correlationCount > 0 ? totalPreservation / correlationCount : 0.8;
};

const calculateQualityScore = (original: DataAnalysisResult, synthetic: DataAnalysisResult): number => {
  const distributionSimilarity = calculateDistributionSimilarity(original, synthetic) / 100;
  const correlationPreservation = calculateCorrelationPreservation(original, synthetic);
  const dataCoverage = calculateDataCoverage(original, synthetic);
  
  return (distributionSimilarity * 0.4 + correlationPreservation * 0.4 + dataCoverage * 0.2);
};

const calculateStatisticalSimilarity = (original: DataAnalysisResult, synthetic: DataAnalysisResult): number => {
  return calculateDistributionSimilarity(original, synthetic) / 100;
};

const calculateDataCoverage = (original: DataAnalysisResult, synthetic: DataAnalysisResult): number => {
  // Calculate how well synthetic data covers the original data space
  const originalColumns = original.columns.length;
  const syntheticColumns = synthetic.columns.length;
  
  const columnCoverage = syntheticColumns / originalColumns;
  
  // Check if synthetic data has similar ranges
  let rangeCoverage = 0;
  let numericFeatureCount = 0;
  
  Object.keys(original.statistics).forEach(feature => {
    if (original.dataTypes[feature] === 'numeric' && synthetic.statistics[feature]) {
      const origRange = original.statistics[feature].max - original.statistics[feature].min;
      const synthRange = synthetic.statistics[feature].max - synthetic.statistics[feature].min;
      
      const rangeSimilarity = 1 - Math.abs(origRange - synthRange) / Math.max(origRange, synthRange);
      rangeCoverage += rangeSimilarity;
      numericFeatureCount++;
    }
  });
  
  const avgRangeCoverage = numericFeatureCount > 0 ? rangeCoverage / numericFeatureCount : 0.9;
  
  return (columnCoverage * 0.3 + avgRangeCoverage * 0.7);
};

const calculateDifferentialPrivacy = (privacyLevel: number): number => {
  // Lower epsilon = higher privacy
  return Math.max(0.1, 3.0 - (privacyLevel * 2.5));
};

const calculateMembershipInferenceRisk = (syntheticData: any[]): number => {
  // Calculate risk based on data uniqueness and size
  const dataSize = syntheticData.length;
  const uniqueCombinations = new Set();
  
  syntheticData.forEach(record => {
    const combination = Object.values(record).join('|');
    uniqueCombinations.add(combination);
  });
  
  const uniquenessRatio = uniqueCombinations.size / dataSize;
  
  // Higher uniqueness = higher risk
  return Math.min(0.3, uniquenessRatio * 0.2);
};

const calculateKSStatistic = (original: DataAnalysisResult, synthetic: DataAnalysisResult): number => {
  // Simplified KS statistic calculation
  let totalKS = 0;
  let featureCount = 0;
  
  Object.keys(original.statistics).forEach(feature => {
    if (original.dataTypes[feature] === 'numeric') {
      const origMean = original.statistics[feature].mean;
      const synthMean = synthetic.statistics[feature]?.mean || origMean;
      const origStd = original.statistics[feature].std;
      
      // Simplified KS statistic
      const ks = Math.abs(origMean - synthMean) / (origStd * 2);
      totalKS += ks;
      featureCount++;
    }
  });
  
  return featureCount > 0 ? totalKS / featureCount : 0.05;
};

const calculateJSDivergence = (original: DataAnalysisResult, synthetic: DataAnalysisResult): number => {
  // Simplified Jensen-Shannon divergence
  let totalJS = 0;
  let featureCount = 0;
  
  Object.keys(original.statistics).forEach(feature => {
    if (original.dataTypes[feature] === 'numeric') {
      const origMean = original.statistics[feature].mean;
      const synthMean = synthetic.statistics[feature]?.mean || origMean;
      const origStd = original.statistics[feature].std;
      const synthStd = synthetic.statistics[feature]?.std || origStd;
      
      // Simplified JS divergence
      const meanDiff = Math.abs(origMean - synthMean) / Math.max(origMean, synthMean);
      const stdDiff = Math.abs(origStd - synthStd) / Math.max(origStd, synthStd);
      
      totalJS += (meanDiff + stdDiff) / 2;
      featureCount++;
    }
  });
  
  return featureCount > 0 ? totalJS / featureCount : 0.1;
};

const calculateFeatureImportance = (original: DataAnalysisResult, synthetic: DataAnalysisResult): { [key: string]: number } => {
  const importance: { [key: string]: number } = {};
  
  Object.keys(original.statistics).forEach(feature => {
    if (original.dataTypes[feature] === 'numeric') {
      const origStd = original.statistics[feature].std;
      const synthStd = synthetic.statistics[feature]?.std || origStd;
      
      // Importance based on how well variance is preserved
      const variancePreservation = 1 - Math.abs(origStd - synthStd) / Math.max(origStd, synthStd);
      importance[feature] = Math.max(0.1, Math.min(1.0, variancePreservation));
    } else {
      // For categorical features, importance based on distribution preservation
      const origDist = original.statistics[feature].distribution;
      const synthDist = synthetic.statistics[feature]?.distribution || origDist;
      
      let totalPreservation = 0;
      let categoryCount = 0;
      
      Object.keys(origDist).forEach(category => {
        const origCount = origDist[category];
        const synthCount = synthDist[category] || 0;
        const preservation = 1 - Math.abs(origCount - synthCount) / Math.max(origCount, synthCount);
        totalPreservation += preservation;
        categoryCount++;
      });
      
      importance[feature] = categoryCount > 0 ? totalPreservation / categoryCount : 0.5;
    }
  });
  
  return importance;
};

const DataGeneration: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [inputMode, setInputMode] = useState<'text' | 'metadata' | 'enterprise'>('text');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [syntheticData, setSyntheticData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [dataAnalysis, setDataAnalysis] = useState<DataAnalysisResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'dashboard'>('generator');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  // Helper functions for dashboard data generation
  const generateCorrelationMatrix = () => {
    const features = ['age', 'income', 'credit_score', 'years_experience', 'performance_score', 'satisfaction_rating'];
    const matrix: { [key: string]: { [key: string]: number } } = {};
    
    features.forEach(feature1 => {
      matrix[feature1] = {};
      features.forEach(feature2 => {
        if (feature1 === feature2) {
          matrix[feature1][feature2] = 1.0;
        } else {
          matrix[feature1][feature2] = (Math.random() - 0.5) * 2; // -1 to 1
        }
      });
    });
    
    return matrix;
  };

  const generateDistributionData = (original: any[], synthetic: any[]) => {
    const numericFeatures = ['age', 'income', 'credit_score', 'years_experience', 'performance_score', 'satisfaction_rating'];
    const categoricalFeatures = ['city', 'education_level', 'department'];
    
    const distributions: any = {
      numeric: {},
      categorical: {}
    };
    
    // Generate numeric distributions
    numericFeatures.forEach(feature => {
      const originalValues = original.map(item => item[feature]);
      const syntheticValues = synthetic.map(item => item[feature]);
      
      distributions.numeric[feature] = {
        original: {
          min: Math.min(...originalValues),
          max: Math.max(...originalValues),
          mean: originalValues.reduce((a, b) => a + b, 0) / originalValues.length,
          std: Math.sqrt(originalValues.reduce((sq, n) => sq + Math.pow(n - (originalValues.reduce((a, b) => a + b, 0) / originalValues.length), 2), 0) / originalValues.length)
        },
        synthetic: {
          min: Math.min(...syntheticValues),
          max: Math.max(...syntheticValues),
          mean: syntheticValues.reduce((a, b) => a + b, 0) / syntheticValues.length,
          std: Math.sqrt(syntheticValues.reduce((sq, n) => sq + Math.pow(n - (syntheticValues.reduce((a, b) => a + b, 0) / syntheticValues.length), 2), 0) / syntheticValues.length)
        }
      };
    });
    
    // Generate categorical distributions
    categoricalFeatures.forEach(feature => {
      const originalCounts: { [key: string]: number } = {};
      const syntheticCounts: { [key: string]: number } = {};
      
      original.forEach(item => {
        originalCounts[item[feature]] = (originalCounts[item[feature]] || 0) + 1;
      });
      
      synthetic.forEach(item => {
        syntheticCounts[item[feature]] = (syntheticCounts[item[feature]] || 0) + 1;
      });
      
      distributions.categorical[feature] = {
        original: originalCounts,
        synthetic: syntheticCounts
      };
    });
    
    return distributions;
  };

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsAnalyzing(true);
      
      try {
        toast.info('Processing File', 'Analyzing uploaded data...');
        
        // Parse the uploaded file
        const parsedData = await SyntheticDataService.parseFile(file);
        setOriginalData(parsedData);
        
        // Analyze the data
        const analysis = await SyntheticDataService.analyzeData(parsedData);
        setDataAnalysis(analysis);
        
        toast.success('File Processed', `${file.name} analyzed successfully. Found ${parsedData.length} records.`);
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error('Processing Failed', error instanceof Error ? error.message : 'Failed to process file');
        setOriginalData([]);
        setDataAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
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

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      setIsAnalyzing(true);
      
      try {
        toast.info('Processing File', 'Analyzing uploaded data...');
        
        // Parse the uploaded file
        const parsedData = await SyntheticDataService.parseFile(file);
        setOriginalData(parsedData);
        
        // Analyze the data
        const analysis = await SyntheticDataService.analyzeData(parsedData);
        setDataAnalysis(analysis);
        
        toast.success('File Processed', `${file.name} analyzed successfully. Found ${parsedData.length} records.`);
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error('Processing Failed', error instanceof Error ? error.message : 'Failed to process file');
        setOriginalData([]);
        setDataAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const generateRealSyntheticData = async () => {
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
    
    try {
      // Step 1: Data Analysis
      setGenerationProgress(20);
      toast.info('Analyzing Data', 'Processing original data structure...');
      
      // Step 2: Model Training Simulation
      setGenerationProgress(40);
      toast.info('Training Model', `Training ${generationSettings.modelType.toUpperCase()} model...`);
      
      // Step 3: Generate Synthetic Data using LLM
      setGenerationProgress(60);
      toast.info('Generating Data', 'Creating synthetic samples with AI...');
      
      const syntheticRequest: SyntheticDataRequest = {
        originalData: originalData,
        modelType: generationSettings.modelType,
        privacyLevel: generationSettings.privacyLevel,
        recordCount: generationSettings.recordCount
      };
      
      const generatedSyntheticData = await SyntheticDataService.generateSyntheticData(syntheticRequest);
      setSyntheticData(generatedSyntheticData);
      
      // Step 4: Quality Assessment
      setGenerationProgress(80);
      toast.info('Evaluating Quality', 'Running quality assessment...');
      
      // Analyze synthetic data and compare with original
      const syntheticAnalysis = await SyntheticDataService.analyzeData(generatedSyntheticData);
      
      // Create comprehensive analysis combining original and synthetic data
      const combinedAnalysis: DataAnalysisResult = {
        ...dataAnalysis!,
        qualityMetrics: {
          ...dataAnalysis!.qualityMetrics,
          // Update metrics based on synthetic data
          totalRecords: generatedSyntheticData.length,
          distributionSimilarity: calculateDistributionSimilarity(dataAnalysis!, syntheticAnalysis),
          driftIndex: calculateDriftIndex(dataAnalysis!, syntheticAnalysis),
          privacyRisk: calculatePrivacyRisk(generatedSyntheticData, generationSettings.privacyLevel),
          modelUtility: calculateModelUtility(dataAnalysis!, syntheticAnalysis),
          qualityScore: calculateQualityScore(dataAnalysis!, syntheticAnalysis),
          privacyScore: generationSettings.privacyLevel,
          statisticalSimilarity: calculateStatisticalSimilarity(dataAnalysis!, syntheticAnalysis),
          dataCoverage: calculateDataCoverage(dataAnalysis!, syntheticAnalysis),
          differentialPrivacyEpsilon: calculateDifferentialPrivacy(generationSettings.privacyLevel),
          membershipInferenceRisk: calculateMembershipInferenceRisk(generatedSyntheticData),
          ksStatistic: calculateKSStatistic(dataAnalysis!, syntheticAnalysis),
          jensenShannonDivergence: calculateJSDivergence(dataAnalysis!, syntheticAnalysis),
          featureImportance: calculateFeatureImportance(dataAnalysis!, syntheticAnalysis)
        }
      };
      
      setDataAnalysis(combinedAnalysis);
      
      // Step 5: Complete
      setGenerationProgress(100);
      setIsGenerating(false);
      
      setGeneratedFiles(prevFiles => 
        prevFiles.map(file => 
          file.id === newFile.id 
            ? { 
                ...file, 
                status: 'completed', 
                size: `${Math.floor(Math.random() * 500) + 100} KB`,
                qualityScore: dataAnalysis?.qualityMetrics?.qualityScore || 0.85
              }
            : file
        )
      );
      
      toast.success('Generation Complete', `Generated ${generationSettings.recordCount} synthetic rows with ${generationSettings.modelType.toUpperCase()}`);
      
    } catch (error) {
      console.error('Error generating synthetic data:', error);
      toast.error('Generation Failed', error instanceof Error ? error.message : 'Failed to generate synthetic data');
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleStartGeneration = async () => {
    if (!uploadedFile || originalData.length === 0) {
      toast.error('No File Uploaded', 'Please upload a data file before generating synthetic data');
      return;
    }
    
    await generateRealSyntheticData();
  };

  const handleStopGeneration = () => {
    setIsGenerating(false);
    setGenerationProgress(0);
    toast.warning('Generation Stopped', 'Data generation was cancelled');
  };

  const downloadSyntheticData = () => {
    if (syntheticData.length === 0) {
      toast.error('No Data', 'No synthetic data available to download');
      return;
    }
    
    const csvContent = generateCSV(syntheticData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthetic_data_${generationSettings.modelType}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Download Started', `Downloaded ${syntheticData.length} synthetic records`);
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
          {/* Main Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'generator'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Brain className="h-4 w-4" />
              <span>Generator</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={syntheticData.length === 0}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
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
      
      {activeTab === 'generator' ? (
        <>
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
                    {(dataAnalysis?.qualityMetrics?.qualityScore * 100)?.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Privacy Score</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {(dataAnalysis?.qualityMetrics?.privacyScore * 100)?.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Statistical Similarity</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {(dataAnalysis?.qualityMetrics?.statisticalSimilarity * 100)?.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Data Coverage</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {(dataAnalysis?.qualityMetrics?.dataCoverage * 100)?.toFixed(1)}%
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
        </>
      ) : (
        /* Comprehensive Visualization Dashboard */
        <div className="space-y-8">
          {/* Overview Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Overview Metrics</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Database className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total Records</p>
                    <p className="text-2xl font-bold text-blue-900">{dataAnalysis?.qualityMetrics?.totalRecords?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-xs text-blue-600">Synthetic data points</div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Distribution Similarity</p>
                    <p className="text-2xl font-bold text-green-900">{dataAnalysis?.qualityMetrics?.distributionSimilarity?.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="text-xs text-green-600">Real vs Synthetic</div>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Drift Index</p>
                    <p className="text-2xl font-bold text-orange-900">{dataAnalysis?.qualityMetrics?.driftIndex?.toFixed(3)}</p>
                  </div>
                </div>
                <div className="text-xs text-orange-600">Statistical drift</div>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Privacy Risk</p>
                    <p className="text-2xl font-bold text-red-900">{dataAnalysis?.qualityMetrics?.privacyRisk?.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="text-xs text-red-600">Risk assessment</div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">Model Utility</p>
                    <p className="text-2xl font-bold text-purple-900">{dataAnalysis?.qualityMetrics?.modelUtility?.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="text-xs text-purple-600">ML training value</div>
              </div>
            </div>
          </div>

          {/* Distribution Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart4 className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Distribution Analysis</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Numeric Features Comparison */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Numeric Features</h4>
                <div className="space-y-6">
                  {dataAnalysis?.distributions?.numeric && Object.entries(dataAnalysis.distributions.numeric).map(([feature, data]: [string, any]) => (
                    <div key={feature} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3 capitalize">{feature.replace('_', ' ')}</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-2">Original Data</p>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Mean:</span>
                              <span className="font-medium">{data.original.mean.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Std:</span>
                              <span className="font-medium">{data.original.std.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Range:</span>
                              <span className="font-medium">{data.original.min.toFixed(0)} - {data.original.max.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-2">Synthetic Data</p>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Mean:</span>
                              <span className="font-medium">{data.synthetic.mean.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Std:</span>
                              <span className="font-medium">{data.synthetic.std.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Range:</span>
                              <span className="font-medium">{data.synthetic.min.toFixed(0)} - {data.synthetic.max.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Categorical Features Comparison */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Categorical Features</h4>
                <div className="space-y-6">
                  {dataAnalysis?.distributions?.categorical && Object.entries(dataAnalysis.distributions.categorical).map(([feature, data]: [string, any]) => (
                    <div key={feature} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3 capitalize">{feature.replace('_', ' ')}</h5>
                      <div className="space-y-3">
                        {Object.keys({...data.original, ...data.synthetic}).map(category => (
                          <div key={category} className="flex items-center space-x-3">
                            <div className="w-20 text-sm text-gray-600 truncate">{category}</div>
                            <div className="flex-1 flex space-x-2">
                              <div className="flex-1 bg-blue-100 rounded-full h-2 relative">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${((data.original[category] || 0) / Math.max(...Object.values(data.original))) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex-1 bg-green-100 rounded-full h-2 relative">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${((data.synthetic[category] || 0) / Math.max(...Object.values(data.synthetic))) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 w-16">
                              {(data.original[category] || 0)} / {(data.synthetic[category] || 0)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Relationships */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <ScatterChart className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Feature Relationships</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Correlation Heatmap */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Correlation Matrix</h4>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    <div></div>
                    {Object.keys(dataAnalysis?.correlations || {}).map(feature => (
                      <div key={feature} className="text-center font-medium text-gray-700 p-1">
                        {feature.substring(0, 3)}
                      </div>
                    ))}
                    {Object.entries(dataAnalysis?.correlations || {}).map(([feature1, correlations]: [string, any]) => (
                      <React.Fragment key={feature1}>
                        <div className="text-center font-medium text-gray-700 p-1">
                          {feature1.substring(0, 3)}
                        </div>
                        {Object.entries(correlations).map(([feature2, value]: [string, any]) => (
                          <div 
                            key={feature2}
                            className={`text-center p-1 rounded text-white font-medium ${
                              Math.abs(value) > 0.7 ? 'bg-red-500' :
                              Math.abs(value) > 0.4 ? 'bg-orange-500' :
                              Math.abs(value) > 0.2 ? 'bg-yellow-500' :
                              'bg-gray-300'
                            }`}
                          >
                            {value.toFixed(2)}
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Feature Importance */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Feature Importance</h4>
                <div className="space-y-3">
                  {dataAnalysis?.qualityMetrics?.featureImportance && Object.entries(dataAnalysis.qualityMetrics.featureImportance)
                    .sort(([,a], [,b]) => b - a)
                    .map(([feature, importance]: [string, any]) => (
                    <div key={feature} className="flex items-center space-x-3">
                      <div className="w-32 text-sm text-gray-700 capitalize">{feature.replace('_', ' ')}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${importance * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-sm font-medium text-gray-900">{(importance * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Quality Radar Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Lock className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-semibold text-gray-900">Privacy & Quality Assessment</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Privacy Metrics */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Privacy Metrics</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Differential Privacy (ε)</span>
                      <span className="text-lg font-bold text-blue-900">{dataAnalysis?.qualityMetrics?.differentialPrivacyEpsilon?.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-blue-600">Lower values = higher privacy</div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-800">Membership Inference Risk</span>
                      <span className="text-lg font-bold text-red-900">{(dataAnalysis?.qualityMetrics?.membershipInferenceRisk * 100)?.toFixed(1)}%</span>
                    </div>
                    <div className="text-xs text-red-600">Risk of data leakage</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">KS Statistic</span>
                      <span className="text-lg font-bold text-green-900">{dataAnalysis?.qualityMetrics?.ksStatistic?.toFixed(3)}</span>
                    </div>
                    <div className="text-xs text-green-600">Distribution similarity</div>
                  </div>
                </div>
              </div>
              
              {/* Quality Radar Chart */}
              <div className="lg:col-span-2">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics Radar</h4>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Distribution Match</span>
                        <span className="text-sm font-medium text-gray-900">{(dataAnalysis?.qualityMetrics?.statisticalSimilarity * 100)?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${dataAnalysis?.qualityMetrics?.statisticalSimilarity * 100}%` }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Correlation Retention</span>
                        <span className="text-sm font-medium text-gray-900">{(dataAnalysis?.qualityMetrics?.qualityScore * 100)?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${dataAnalysis?.qualityMetrics?.qualityScore * 100}%` }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Data Diversity</span>
                        <span className="text-sm font-medium text-gray-900">{(dataAnalysis?.qualityMetrics?.dataCoverage * 100)?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${dataAnalysis?.qualityMetrics?.dataCoverage * 100}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Model Utility</span>
                        <span className="text-sm font-medium text-gray-900">{dataAnalysis?.qualityMetrics?.modelUtility?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${dataAnalysis?.qualityMetrics?.modelUtility}%` }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Privacy Risk</span>
                        <span className="text-sm font-medium text-gray-900">{dataAnalysis?.qualityMetrics?.privacyRisk?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${dataAnalysis?.qualityMetrics?.privacyRisk}%` }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Jensen-Shannon Divergence</span>
                        <span className="text-sm font-medium text-gray-900">{dataAnalysis?.qualityMetrics?.jensenShannonDivergence?.toFixed(3)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${dataAnalysis?.qualityMetrics?.jensenShannonDivergence * 1000}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary & Recommendations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Eye className="h-6 w-6 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-900">Summary & Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quality Assessment</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">High Distribution Similarity</p>
                      <p className="text-xs text-green-600">Synthetic data closely matches original distributions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Good Feature Relationships</p>
                      <p className="text-xs text-blue-600">Correlations are well preserved in synthetic data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Moderate Privacy Risk</p>
                      <p className="text-xs text-yellow-600">Consider adjusting privacy parameters for sensitive data</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-800 mb-1">For ML Training</p>
                    <p className="text-xs text-gray-600">This synthetic data is suitable for model training with {dataAnalysis?.qualityMetrics?.modelUtility?.toFixed(1)}% utility score</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-800 mb-1">Privacy Enhancement</p>
                    <p className="text-xs text-gray-600">Consider increasing privacy level to reduce membership inference risk</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-800 mb-1">Data Validation</p>
                    <p className="text-xs text-gray-600">Perform additional statistical tests before production use</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DataGeneration;
