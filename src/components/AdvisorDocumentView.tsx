'use client';

import React from 'react';
import { useDocuments } from '@/context/DocumentContext';
import { Document, StudentType } from '@/types/documents';

interface AdvisorDocumentViewProps {
  studentId: string;
  studentName: string;
  studentType: StudentType;
}

export function AdvisorDocumentView({ studentId, studentName, studentType }: AdvisorDocumentViewProps) {
  const { 
    documents, 
    getDocumentsByStudentType,
    getDocumentsByStage,
    approveDocument,
    rejectDocument,
    currentStage,
    setCurrentStage
  } = useDocuments();

  const stageDocuments = getDocumentsByStage(currentStage)
    .filter(doc => doc.studentTypes.includes(studentType));

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

  const pendingReview = stageDocuments.filter(doc => doc.status === 'UPLOADED').length;

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30">
      {/* Üst Bilgi Alanı */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#002757] dark:text-blue-300">
              Belge Durumu
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {studentName} - {(studentType || 'UNIVERSITY_STUDENT').replace(/_/g, ' ')}
            </p>
          </div>
          {pendingReview > 0 && (
            <div className="bg-yellow-100/70 dark:bg-yellow-900/30 px-4 py-2 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {pendingReview} belge incelemenizi bekliyor
              </p>
            </div>
          )}
        </div>
      </div>

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

      {/* Belge Listesi */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {stageDocuments.map((doc) => (
          <div key={doc.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-[#002757] dark:text-blue-300">{doc.name}</h4>
                {doc.description && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{doc.description}</p>
                )}
              </div>
              {getStatusBadge(doc.status)}
            </div>
            
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 bg-gray-100/70 hover:bg-gray-200/70 dark:text-gray-300 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Görüntüle
                </a>
              )}
              
              {doc.status === 'UPLOADED' && (
                <>
                  <button
                    onClick={() => approveDocument(doc.id)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-green-600/90 hover:bg-green-700/90 transition-colors"
                  >
                    <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Onayla
                  </button>
                  <button
                    onClick={() => rejectDocument(doc.id)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-red-600/90 hover:bg-red-700/90 transition-colors"
                  >
                    <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reddet
                  </button>
                </>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
              {doc.uploadedAt && (
                <span className="flex items-center">
                  <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Yükleme: {doc.uploadedAt.toLocaleString()}
                </span>
              )}
              {doc.reviewedAt && (
                <span className="flex items-center">
                  <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  İnceleme: {doc.reviewedAt.toLocaleString()}
                </span>
              )}
            </div>

            {doc.status === 'REJECTED' && (
              <p className="mt-2 text-xs text-red-500 dark:text-red-400 flex items-center">
                <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Belge reddedildi. Öğrencinin yeniden yüklemesi bekleniyor.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 