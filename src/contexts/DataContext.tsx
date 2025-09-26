import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

export interface GeneratedDataset {
  id: string;
  name: string;
  type: 'synthetic' | 'real' | 'anonymized';
  size: number;
  columns: string[];
  dataTypes: string[];
  content: any[];
  metadata: {
    description: string;
    createdAt: Date;
    source: string;
    qualityScore: number;
    privacyLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  };
  filePath?: string;
  downloadUrl?: string;
}

export interface DataEvaluationResult {
  id: string;
  datasetId: string;
  guidelineId: string;
  timestamp: Date;
  overallComplianceScore: number;
  gdprComplianceScore: number;
  enterpriseComplianceScore: number;
  dataQualityScore: number;
  anomalies: DataAnomaly[];
  violations: ComplianceViolation[];
  recommendations: string[];
  status: 'evaluating' | 'completed' | 'error';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  fileName?: string;
}

export interface DataAnomaly {
  id: string;
  type: 'data_quality' | 'privacy_breach' | 'access_violation' | 'retention_issue' | 'classification_error' | 'data_flow_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedFields: string[];
  confidence: number;
  recommendation: string;
  detectedAt: Date;
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  ruleDescription: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedData: string[];
  gdprArticle?: string;
  enterpriseRule?: string;
  recommendation: string;
  detectedAt: Date;
}

interface DataContextType {
  // Datasets
  generatedDatasets: GeneratedDataset[];
  addDataset: (dataset: GeneratedDataset) => void;
  removeDataset: (id: string) => void;
  updateDataset: (id: string, updates: Partial<GeneratedDataset>) => void;
  
  // Evaluation Results
  evaluationResults: DataEvaluationResult[];
  addEvaluationResult: (result: DataEvaluationResult) => void;
  removeEvaluationResult: (id: string) => void;
  
  // Selected for evaluation
  selectedDataset: GeneratedDataset | null;
  setSelectedDataset: (dataset: GeneratedDataset | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [generatedDatasets, setGeneratedDatasets] = useState<GeneratedDataset[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<DataEvaluationResult[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<GeneratedDataset | null>(null);

  const addDataset = useCallback((dataset: GeneratedDataset) => {
    setGeneratedDatasets(prev => {
      if (prev.some(d => d.id === dataset.id)) {
        return prev; // Prevent duplicates
      }
      return [dataset, ...prev];
    });
  }, []);

  const removeDataset = useCallback((id: string) => {
    setGeneratedDatasets(prev => prev.filter(d => d.id !== id));
  }, []);

  const updateDataset = useCallback((id: string, updates: Partial<GeneratedDataset>) => {
    setGeneratedDatasets(prev =>
      prev.map(d => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  const addEvaluationResult = useCallback((result: DataEvaluationResult) => {
    setEvaluationResults(prev => [result, ...prev]);
  }, []);

  const removeEvaluationResult = useCallback((id: string) => {
    setEvaluationResults(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <DataContext.Provider value={{
      generatedDatasets,
      addDataset,
      removeDataset,
      updateDataset,
      evaluationResults,
      addEvaluationResult,
      removeEvaluationResult,
      selectedDataset,
      setSelectedDataset
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
