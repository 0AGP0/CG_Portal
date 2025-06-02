'use client';

import React, { useRef } from 'react';
import { useDocuments } from '@/context/DocumentContext';
import { StudentType, Document, ApplicationStage } from '@/types/documents';

interface DocumentUploadProps {
  studentType: StudentType;
}

export function DocumentUpload({ studentType }: DocumentUploadProps) {
  const { 
    documents, 
    uploadDocument, 
    getDocumentsByStudentType,
    getDocumentsByStage,
    currentStage,
    setCurrentStage 
  } = useDocuments();
  
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const stageDocuments = getDocumentsByStage(currentStage)
    .filter(doc => doc.studentTypes.includes(studentType));

  const handleFileChange = async (documentId: string, file: File) => {
    try {
      await uploadDocument(documentId, file);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
    }
  };

  const setFileInputRef = (element: HTMLInputElement | null, docId: string) => {
    fileInputRefs.current[docId] = element;
  };

  const getStatusBadge = (status: Document['status']) => {
    const statusColors = {
      PENDING: 'bg-yellow-100/70 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      UPLOADED: 'bg-blue-100/70 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      APPROVED: 'bg-green-100/70 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      REJECTED: 'bg-red-100/70 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status === 'PENDING' && 'Bekliyor'}
        {status === 'UPLOADED' && 'Yüklendi'}
        {status === 'APPROVED' && 'Onaylandı'}
        {status === 'REJECTED' && 'Reddedildi'}
      </span>
    );
  };

  const pendingDocuments = stageDocuments.filter(doc => doc.status === 'PENDING');

  return (
    <div className="p-6 space-y-6">
      {/* Aşama Seçici */}
      <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentStage('PREPARATION')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentStage === 'PREPARATION'
                ? 'bg-blue-100/70 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-white/70 text-gray-700 hover:bg-gray-50 dark:bg-gray-700/30 dark:text-gray-300 dark:hover:bg-gray-700/50'
            }`}
          >
            Hazırlık Aşaması
          </button>
          <button
            onClick={() => setCurrentStage('VISA_APPLICATION')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentStage === 'VISA_APPLICATION'
                ? 'bg-blue-100/70 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                : 'bg-white/70 text-gray-700 hover:bg-gray-50 dark:bg-gray-700/30 dark:text-gray-300 dark:hover:bg-gray-700/50'
            }`}
          >
            Vize Başvuru Aşaması
          </button>
        </div>
      </div>

      {/* Bildirim Alanı */}
      {pendingDocuments.length > 0 && (
        <div className="bg-yellow-100/70 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {currentStage === 'PREPARATION'
                  ? 'Hazırlık aşaması için yüklemeniz gereken belgeler bulunmaktadır.'
                  : 'Vize başvurusu için yüklemeniz gereken belgeler bulunmaktadır.'}
              </p>
              <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
                Bu aşamada yüklemeniz gereken {pendingDocuments.length} belge var
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Belge Listesi */}
      <div className="space-y-4">
        {stageDocuments.map((doc) => (
          <div
            key={doc.id}
            className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-100/60 dark:border-gray-700/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#002757] dark:text-blue-300">{doc.name}</h3>
              {getStatusBadge(doc.status)}
            </div>
            {doc.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{doc.description}</p>
            )}
            <div className="flex items-center gap-2">
              <input
                type="file"
                className="hidden"
                ref={(el) => setFileInputRef(el, doc.id)}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileChange(doc.id, file);
                  }
                }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <button
                onClick={() => fileInputRefs.current[doc.id]?.click()}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  doc.status === 'REJECTED'
                    ? 'bg-red-600/90 text-white hover:bg-red-700/90'
                    : doc.status === 'APPROVED'
                    ? 'bg-green-600/90 text-white cursor-not-allowed'
                    : 'bg-blue-600/90 text-white hover:bg-blue-700/90'
                }`}
                disabled={doc.status === 'APPROVED'}
              >
                {doc.status === 'PENDING' && 'Dosya Yükle'}
                {doc.status === 'UPLOADED' && 'Dosyayı Güncelle'}
                {doc.status === 'REJECTED' && 'Yeniden Yükle'}
                {doc.status === 'APPROVED' && 'Onaylandı'}
              </button>
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 bg-gray-100/70 hover:bg-gray-200/70 dark:text-gray-300 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Görüntüle
                </a>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
              {doc.uploadedAt && (
                <span className="flex items-center">
                  <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Son yükleme: {doc.uploadedAt.toLocaleString()}
                </span>
              )}
            </div>
            {doc.status === 'REJECTED' && (
              <p className="mt-2 text-xs text-red-500 dark:text-red-400 flex items-center">
                <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Belgeniz reddedildi. Lütfen yeniden yükleyin.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 