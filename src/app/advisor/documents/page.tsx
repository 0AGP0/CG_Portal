'use client';

import { useState, useEffect } from 'react';
import { DocumentProvider } from '@/context/DocumentContext';
import { AdvisorDocumentView } from '@/components/AdvisorDocumentView';
import Layout from '@/components/Layout';
import { useStudents } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';

type StudentType = 'UNIVERSITY_STUDENT' | 'HIGH_SCHOOL_GRADUATE' | 'UNIVERSITY_GRADUATE';

interface Student {
  email: string;
  name: string;
  type: StudentType;
  stage: string;
  documents?: Array<{
    isUploaded: boolean;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export default function AdvisorDocumentsPage() {
  const { user } = useAuth();
  const { students, isLoading } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // URL'den öğrenci parametresini al
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentEmail = params.get('student');
    
    if (studentEmail && students.length > 0) {
      const student = students.find((s: Student) => s.email === studentEmail);
      if (student) {
        setSelectedStudent(student);
      }
    }
  }, [students]);

  // Öğrenci arama
  const filteredStudents = students.filter((student: Student) => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <DocumentProvider>
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#002757]">Öğrenci Belgeleri</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Öğrenci Listesi */}
            <div className="lg:col-span-1">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-[#002757] dark:text-blue-300">Öğrencilerim</h2>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Öğrenci ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <p>Öğrenciler yükleniyor...</p>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <p>Sonuç bulunamadı</p>
                    </div>
                  ) : (
                    filteredStudents.map((student: Student) => (
                    <button
                        key={student.email}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full p-4 text-left hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors ${
                          selectedStudent?.email === student.email ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#002757] dark:text-blue-300">{student.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            student.stage === 'PREPARATION'
                              ? 'bg-yellow-100/70 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-green-100/70 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {student.stage === 'PREPARATION' ? 'Hazırlık' : 'Vize'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{student.email}</span>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="flex items-center text-yellow-600 dark:text-yellow-400">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                              {student.documents?.filter((doc: any) => !doc.isUploaded).length || 0}
                          </span>
                          <span className="flex items-center text-blue-600 dark:text-blue-400">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                              {student.documents?.filter((doc: any) => doc.isUploaded).length || 0}
                          </span>
                        </div>
                      </div>
                    </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Belge Görüntüleme Alanı */}
            <div className="lg:col-span-3">
              {selectedStudent ? (
                <AdvisorDocumentView
                  studentId={selectedStudent.email}
                  studentName={selectedStudent.name}
                  studentType={(selectedStudent.type || 'UNIVERSITY_STUDENT') as StudentType}
                />
              ) : (
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 text-center">
                  <div className="text-gray-400 dark:text-gray-500">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-[#002757] dark:text-blue-300">
                    Belge Görüntüleme
                  </h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Belgeleri görüntülemek için listeden bir öğrenci seçin
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DocumentProvider>
    </Layout>
  );
} 