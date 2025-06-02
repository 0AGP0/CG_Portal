"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useStudents } from '@/hooks/useData';

interface University {
  id: string;
  name: string;
  country: string;
  programs: string[];
  logo?: string;
}

interface Student {
  email: string;
  name: string;
}

interface Application {
  id: string;
  universityId: string;
  university: string;
  program: string;
  status: 'draft' | 'submitted' | 'in_review' | 'accepted' | 'rejected';
  submissionDate: string | null;
  decisionDate: string | null;
  notes: string | null;
  documents: string[];
  studentEmail: string;
  studentName: string;
}

export default function AdvisorApplicationsPage() {
  const { user } = useAuth();
  const { students } = useStudents();
  const [applications, setApplications] = useState<Application[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [newApplication, setNewApplication] = useState<Partial<Application>>({
    universityId: '',
    program: '',
    status: 'draft',
    submissionDate: null,
    notes: '',
    documents: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Başvuruları çek
        const applicationsResponse = await fetch('/api/advisor/applications', {
          headers: {
            'x-user-email': user?.email || ''
          }
        });

        // Üniversiteleri çek
        const universitiesResponse = await fetch('/api/universities');

        if (applicationsResponse.ok) {
          const data = await applicationsResponse.json();
          setApplications(data.applications || []);
        } else {
          // API'den veri gelmezse örnek veri
          setApplications([
            {
              id: '1',
              universityId: 'uni1',
              university: 'Oxford University',
              program: 'Business Administration',
              status: 'submitted',
              submissionDate: '2023-05-15',
              decisionDate: null,
              notes: 'Bekleme süresi 4-6 hafta',
              documents: ['Transkript', 'Motivasyon Mektubu', 'CV'],
              studentEmail: 'burcu.shut@gmail.com',
              studentName: 'Burcu Shut'
            }
          ]);
        }

        if (universitiesResponse.ok) {
          const data = await universitiesResponse.json();
          setUniversities(data.universities || []);
        } else {
          // API'den veri gelmezse örnek veri
          setUniversities([
            {
              id: 'uni1',
              name: 'Oxford University',
              country: 'İngiltere',
              programs: ['Business Administration', 'Computer Science', 'Economics'],
              logo: 'https://example.com/oxford-logo.png'
            },
            {
              id: 'uni2',
              name: 'Harvard University',
              country: 'ABD',
              programs: ['Business Administration', 'Computer Science', 'Law'],
              logo: 'https://example.com/harvard-logo.png'
            }
          ]);
        }
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCreateApplication = async () => {
    try {
      if (!selectedStudent) {
        alert('Lütfen bir öğrenci seçin');
        return;
      }

      const selectedUniversity = universities.find(uni => uni.id === newApplication.universityId);
      
      if (!selectedUniversity) {
        alert('Lütfen bir üniversite seçin');
        return;
      }

      const selectedStudentData = students.find((s: Student) => s.email === selectedStudent);
      
      if (!selectedStudentData) {
        alert('Seçilen öğrenci bulunamadı');
        return;
      }
      
      // Yeni başvuru oluştur
      const application: Application = {
        id: Date.now().toString(),
        universityId: newApplication.universityId || '',
        university: selectedUniversity.name,
        program: newApplication.program || '',
        status: 'draft',
        submissionDate: null,
        decisionDate: null,
        notes: newApplication.notes || null,
        documents: [],
        studentEmail: selectedStudent,
        studentName: selectedStudentData.name
      };
      
      // API'ye kaydet (gerçek uygulamada)
      // const response = await fetch('/api/advisor/applications', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'x-user-email': user?.email || ''
      //   },
      //   body: JSON.stringify(application)
      // });
      
      // API response beklemeden state güncelle
      setApplications([...applications, application]);
      
      // Formu temizle ve kapat
      setNewApplication({
        universityId: '',
        program: '',
        status: 'draft',
        submissionDate: null,
        notes: '',
        documents: []
      });
      setSelectedStudent('');
      setIsCreating(false);
      
    } catch (error) {
      console.error('Başvuru oluşturma hatası:', error);
    }
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsViewingDetails(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: Application['status']) => {
    try {
      // API'ye güncelleme gönder (gerçek uygulamada)
      // await fetch(`/api/advisor/applications/${id}/status`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'x-user-email': user?.email || ''
      //   },
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // Başarılı olduğunu varsayalım ve state'i güncelle
      setApplications(applications.map(app => 
        app.id === id 
          ? { 
              ...app, 
              status: newStatus, 
              submissionDate: newStatus === 'submitted' ? new Date().toISOString().split('T')[0] : app.submissionDate 
            } 
          : app
      ));
      
      // Eğer detaylar açıksa ve değişen başvuruysa onu da güncelle
      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication({
          ...selectedApplication,
          status: newStatus,
          submissionDate: newStatus === 'submitted' ? new Date().toISOString().split('T')[0] : selectedApplication.submissionDate
        });
      }
      
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
    }
  };

  const getStatusText = (status: Application['status']) => {
    switch (status) {
      case 'draft': return 'Taslak';
      case 'submitted': return 'Gönderildi';
      case 'in_review': return 'İncelemede';
      case 'accepted': return 'Kabul Edildi';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (user.role !== 'advisor') {
    return (
      <Layout>
        <div className="bg-red-100 p-4 rounded-lg text-red-800">
          <p>Bu sayfaya erişim izniniz bulunmamaktadır. Bu sayfa sadece danışmanlar içindir.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#002757]">Başvuru Yönetimi</h1>
            <p className="text-default mt-1">Öğrencilerinizin üniversite başvurularını buradan yönetebilirsiniz.</p>
          </div>
          
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>Yeni Başvuru</span>
            <span className="text-lg">+</span>
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">Henüz başvuru bulunmuyor.</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Yeni Başvuru Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <motion.div 
                key={app.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300">{app.university}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{app.studentName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {getStatusText(app.status)}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-2">{app.program}</p>
                
                {app.submissionDate && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span className="font-medium">Başvuru Tarihi:</span> {app.submissionDate}
                  </p>
                )}
                
                {app.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-medium">Not:</span> {app.notes}
                  </p>
                )}
                
                {app.documents && app.documents.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Belgeler:</p>
                    <div className="flex flex-wrap gap-1">
                      {app.documents.map((doc, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100/70 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-auto pt-4 flex space-x-2">
                  <button 
                    onClick={() => handleViewDetails(app)}
                    className="flex-1 py-2 px-3 bg-gray-100/70 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200/70 dark:hover:bg-gray-600/50 transition-colors text-sm"
                  >
                    Detaylar
                  </button>
                  
                  {app.status === 'draft' && (
                    <button 
                      onClick={() => handleUpdateStatus(app.id, 'submitted')}
                      className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Gönder
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Yeni Başvuru Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-100/60 dark:border-gray-700/30"
            >
              <h2 className="text-2xl font-semibold text-[#002757] dark:text-blue-300 mb-4">Yeni Başvuru</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Öğrenci</label>
                  <select 
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90"
                  >
                    <option value="">Öğrenci Seçin</option>
                    {students.map((student: Student) => (
                      <option key={student.email} value={student.email}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Üniversite</label>
                  <select 
                    value={newApplication.universityId || ''}
                    onChange={(e) => setNewApplication({...newApplication, universityId: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90"
                  >
                    <option value="">Üniversite Seçin</option>
                    {universities.map(uni => (
                      <option key={uni.id} value={uni.id}>{uni.name} ({uni.country})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program</label>
                  <select 
                    value={newApplication.program || ''}
                    onChange={(e) => setNewApplication({...newApplication, program: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90"
                    disabled={!newApplication.universityId}
                  >
                    <option value="">Program Seçin</option>
                    {newApplication.universityId && 
                      universities
                        .find(uni => uni.id === newApplication.universityId)
                        ?.programs.map((program, index) => (
                          <option key={index} value={program}>{program}</option>
                        ))
                    }
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notlar</label>
                  <textarea 
                    value={newApplication.notes || ''}
                    onChange={(e) => setNewApplication({...newApplication, notes: e.target.value})}
                    rows={3}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90"
                    placeholder="İsteğe bağlı notlar..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300/80 dark:hover:bg-gray-600/80 transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={handleCreateApplication}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Oluştur
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Başvuru Detayları Modal */}
        {isViewingDetails && selectedApplication && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 rounded-lg shadow-xl max-w-2xl w-full border border-gray-100/60 dark:border-gray-700/30"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#002757] dark:text-blue-300">Başvuru Detayları</h2>
                <button 
                  onClick={() => setIsViewingDetails(false)}
                  className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#002757] dark:text-blue-300">{selectedApplication.university}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{selectedApplication.program}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedApplication.studentName}</p>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Durum</p>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusText(selectedApplication.status)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Başvuru Tarihi</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedApplication.submissionDate 
                      ? new Date(selectedApplication.submissionDate).toLocaleDateString('tr-TR')
                      : 'Henüz gönderilmedi'}
                  </p>
                </div>

                {selectedApplication.decisionDate && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Karar Tarihi</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {new Date(selectedApplication.decisionDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}
              </div>

              {selectedApplication.notes && (
                <div className="mb-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Notlar</p>
                  <p className="bg-gray-50/80 dark:bg-gray-700/50 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                    {selectedApplication.notes}
                  </p>
                </div>
              )}

              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Dökümanlar</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.documents.map((doc, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-100/70 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.status === 'draft' && (
                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    onClick={() => {
                      handleUpdateStatus(selectedApplication.id, 'submitted');
                      setIsViewingDetails(false);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Başvuruyu Gönder
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
} 