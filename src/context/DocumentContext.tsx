'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Document, DocumentStatus, PREPARATION_DOCUMENTS, VISA_DOCUMENTS, StudentType, ApplicationStage } from '@/types/documents';

interface DocumentContextType {
  documents: Document[];
  uploadDocument: (documentId: string, file: File) => Promise<void>;
  getDocumentsByStudentType: (studentType: StudentType) => Document[];
  getDocumentsByStage: (stage: ApplicationStage) => Document[];
  getPendingDocuments: () => Document[];
  approveDocument: (documentId: string) => void;
  rejectDocument: (documentId: string) => void;
  currentStage: ApplicationStage;
  setCurrentStage: (stage: ApplicationStage) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([...PREPARATION_DOCUMENTS, ...VISA_DOCUMENTS]);
  const [currentStage, setCurrentStage] = useState<ApplicationStage>('PREPARATION');

  const uploadDocument = async (documentId: string, file: File) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          status: 'UPLOADED' as DocumentStatus,
          uploadedAt: new Date(),
          fileUrl: URL.createObjectURL(file)
        };
      }
      return doc;
    }));
  };

  const approveDocument = (documentId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          status: 'APPROVED' as DocumentStatus,
          reviewedAt: new Date()
        };
      }
      return doc;
    }));
  };

  const rejectDocument = (documentId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          status: 'REJECTED' as DocumentStatus,
          reviewedAt: new Date()
        };
      }
      return doc;
    }));
  };

  const getDocumentsByStudentType = (studentType: StudentType) => {
    return documents.filter(doc => doc.studentTypes.includes(studentType));
  };

  const getDocumentsByStage = (stage: ApplicationStage) => {
    return documents.filter(doc => doc.stage === stage);
  };

  const getPendingDocuments = () => {
    return documents.filter(doc => doc.status === 'PENDING' && doc.stage === currentStage);
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      uploadDocument,
      getDocumentsByStudentType,
      getDocumentsByStage,
      getPendingDocuments,
      approveDocument,
      rejectDocument,
      currentStage,
      setCurrentStage
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
} 