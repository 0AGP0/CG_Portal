"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

interface University {
  id: string;
  name: string;
  country: string;
  programs: string[];
  logo: string;
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
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  useEffect(() => {
    // Başvuruları ve üniversiteleri API'den çek
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        if (user) {
          // Başvuruları çek
          const applicationsResponse = await fetch('/api/student/applications', {
            headers: {
              'x-user-email': user.email
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
                documents: ['Transkript', 'Motivasyon Mektubu', 'CV']
              },
              {
                id: '2',
                universityId: 'uni2',
                university: 'Harvard University',
                program: 'Computer Science',
                status: 'in_review',
                submissionDate: '2023-04-10',
                decisionDate: null,
                notes: 'Ek belge talep edildi',
                documents: ['Transkript', 'Motivasyon Mektubu', 'Referans Mektubu']
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
                programs: ['Business Administration', 'Economics', 'International Relations'],
                logo: 'https://placehold.co/100x100/ffc105/002757?text=Oxford'
              },
              {
                id: 'uni2',
                name: 'Harvard University',
                country: 'Amerika Birleşik Devletleri',
                programs: ['Computer Science', 'Law', 'Business Administration', 'Medicine'],
                logo: 'https://placehold.co/100x100/ffc105/002757?text=Harvard'
              },
              {
                id: 'uni3',
                name: 'ETH Zurich',
                country: 'İsviçre',
                programs: ['Engineering', 'Computer Science', 'Physics'],
                logo: 'https://placehold.co/100x100/ffc105/002757?text=ETH'
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsViewingDetails(true);
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
  
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#002757]">Başvurularım</h1>
          <p className="text-default mt-1">Danışmanınız tarafından yapılan üniversite başvurularınızı buradan takip edebilirsiniz.</p>
        </div>
        
        {applications.length === 0 ? (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">Henüz başvurunuz bulunmuyor.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Danışmanınız başvurularınızı oluşturduğunda burada listelenecektir.</p>
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
                  <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300">{app.university}</h2>
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
                
                <div className="mt-auto pt-4">
                    <button 
                    onClick={() => handleViewDetails(app)}
                    className="w-full py-2 px-3 bg-gray-100/70 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200/70 dark:hover:bg-gray-600/50 transition-colors text-sm"
                    >
                      Detaylar
                    </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
        
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
          </motion.div>
          </div>
        )}
    </Layout>
  );
} 