import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, FileText, RefreshCw, Settings, Play, Pause, Square, BarChart3, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

const DataGeneration: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedFiles, setGeneratedFiles] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    timestamp: Date;
    status: 'generating' | 'completed' | 'error';
  }>>([]);
  const [generationSettings, setGenerationSettings] = useState({
    dataType: 'synthetic',
    recordCount: 1000,
    includePII: false,
    gdprCompliant: true,
    dataFormat: 'csv'
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

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const newFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${generationSettings.dataType}_data_${new Date().toISOString().split('T')[0]}.${generationSettings.dataFormat}`,
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
          toast.success('Generation Complete', 'Data file generated successfully');
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
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


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8 bg-white min-h-screen"
    >
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-semibold text-black">Data Generation</h1>
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
