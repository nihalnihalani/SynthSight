import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ExtractedDocument {
  id: string;
  fileName: string;
  uploadDate: Date;
  content: string;
  summary: string;
  metadata: {
    title: string;
    author: string;
    pages: number;
    wordCount: number;
    extractedAt: string;
  };
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  topics: string[];
  isExpanded: boolean;
}

interface DocumentContextType {
  extractedDocuments: ExtractedDocument[];
  addDocument: (document: ExtractedDocument) => void;
  removeDocument: (documentId: string) => void;
  updateDocument: (documentId: string, updates: Partial<ExtractedDocument>) => void;
  clearDocuments: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
};

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
  const [extractedDocuments, setExtractedDocuments] = useState<ExtractedDocument[]>([]);

  const addDocument = (document: ExtractedDocument) => {
    setExtractedDocuments(prev => [document, ...prev]);
  };

  const removeDocument = (documentId: string) => {
    setExtractedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const updateDocument = (documentId: string, updates: Partial<ExtractedDocument>) => {
    setExtractedDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId ? { ...doc, ...updates } : doc
      )
    );
  };

  const clearDocuments = () => {
    setExtractedDocuments([]);
  };

  return (
    <DocumentContext.Provider
      value={{
        extractedDocuments,
        addDocument,
        removeDocument,
        updateDocument,
        clearDocuments
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};
