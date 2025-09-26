import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { DocumentUpload as DocumentUploadType, AnalysisType } from '../types';

interface DocumentUploadProps {
  onDocumentSelect: (document: DocumentUploadType, analysisTypes: AnalysisType[]) => void;
  isLoading: boolean;
  disabled?: boolean;
  uploadMode: 'metadata' | 'enterprise';
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  onDocumentSelect, 
  isLoading, 
  disabled = false,
  uploadMode
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAnalysisTypes, setSelectedAnalysisTypes] = useState<AnalysisType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/csv',
    'application/json'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    if (!acceptedFileTypes.includes(file.type)) {
      return 'Please upload a PDF, Word document, text file, CSV, or JSON file.';
    }
    if (file.size > maxFileSize) {
      return 'File size must be less than 10MB.';
    }
    return null;
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        if (file.type === 'application/pdf') {
          // For PDF files, we'll need a PDF parser library in a real implementation
          // For now, we'll return a placeholder
          resolve('PDF content extraction not implemented in this demo. Please use text files for testing.');
        } else if (file.type === 'text/plain' || file.type === 'text/csv') {
          resolve(content);
        } else if (file.type === 'application/json') {
          try {
            const jsonData = JSON.parse(content);
            resolve(JSON.stringify(jsonData, null, 2));
          } catch (err) {
            reject(new Error('Invalid JSON file'));
          }
        } else {
          // For Word documents, we'd need a library like mammoth.js
          resolve('Word document content extraction not implemented in this demo. Please use text files for testing.');
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSelectedFile(file);
      const content = await extractTextFromFile(file);
      
      const documentUpload: DocumentUploadType = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadTimestamp: new Date(),
        content: content
      };

      onDocumentSelect(documentUpload, selectedAnalysisTypes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    }
  }, [onDocumentSelect, selectedAnalysisTypes]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || isLoading) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect, disabled, isLoading]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    setSelectedAnalysisTypes([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalysisTypeChange = (analysisType: AnalysisType, checked: boolean) => {
    if (checked) {
      setSelectedAnalysisTypes(prev => [...prev, analysisType]);
    } else {
      setSelectedAnalysisTypes(prev => prev.filter(type => type !== analysisType));
    }
  };

  // Get available analysis types based on upload mode
  const getAvailableAnalysisTypes = (): AnalysisType[] => {
    if (uploadMode === 'metadata') {
      return ['gdpr_compliance', 'text'];
    } else if (uploadMode === 'enterprise') {
      return ['enterprise_guidelines', 'text'];
    }
    return ['text'];
  };

  const openFileDialog = () => {
    if (fileInputRef.current && !disabled && !isLoading) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Analysis Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Analysis Types</label>
        <div className="space-y-2">
          {getAvailableAnalysisTypes().map((analysisType) => (
            <label key={analysisType} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedAnalysisTypes.includes(analysisType)}
                onChange={(e) => handleAnalysisTypeChange(analysisType, e.target.checked)}
                disabled={disabled || isLoading}
                className="text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">
                {analysisType === 'gdpr_compliance' && 'GDPR Compliance Check'}
                {analysisType === 'enterprise_guidelines' && 'Enterprise Guidelines Analysis'}
                {analysisType === 'text' && 'General Text Analysis'}
              </span>
            </label>
          ))}
        </div>
        {selectedAnalysisTypes.length === 0 && (
          <p className="text-xs text-amber-600">Please select at least one analysis type</p>
        )}
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isLoading}
        />

        <div className="text-center">
          {selectedFile ? (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
              <div className="text-sm font-medium text-gray-900">{selectedFile.name}</div>
              <div className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="text-red-600 hover:text-red-800 text-xs"
                disabled={disabled || isLoading}
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
              <div className="text-sm font-medium text-gray-900">
                {dragActive ? 'Drop your file here' : 'Click to upload or drag and drop'}
              </div>
              <div className="text-xs text-gray-500">
                PDF, Word, TXT, CSV, or JSON (max 10MB)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-blue-600 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing document...</span>
        </div>
      )}

      {/* Analysis Type Descriptions */}
      <div className="text-xs text-gray-600 space-y-1">
        {uploadMode === 'metadata' && (
          <div>
            <strong>Metadata Upload:</strong> Upload your metadata files to check GDPR compliance and perform general text analysis. Select the analysis types you want to run on your metadata.
          </div>
        )}
        {uploadMode === 'enterprise' && (
          <div>
            <strong>Enterprise Guidelines Upload:</strong> Upload documents to evaluate against your organization's data governance policies and perform enterprise guidelines analysis.
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
