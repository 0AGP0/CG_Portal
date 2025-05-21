"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

interface EducationRecord {
  id: string;
  degreeType: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  gpa: string;
  certificates: string[];
  current: boolean;
}

export default function EducationPage() {
  const { user } = useAuth();
  const [educationData, setEducationData] = useState<EducationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<EducationRecord | null>(null);

  useEffect(() => {
    // Eğitim bilgilerini API'den çek
    const fetchEducationData = async () => {
      setIsLoading(true);
      
      try {
        if (user) {
          const response = await fetch('/api/student/education', {
            headers: {
              'x-user-email': user.email
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setEducationData(data.education || []);
          } else {
            // API'den veri gelmezse örnek veri
            setEducationData([
              {
                id: '1',
                degreeType: 'Lisans',
                institution: 'Ankara Üniversitesi',
                fieldOfStudy: 'İşletme',
                startDate: '2019-09-01',
                endDate: null,
                gpa: '3.55',
                certificates: ['TOEFL: 95', 'IELTS: 7.0'],
                current: true
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Eğitim bilgileri çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEducationData();
  }, [user]);
  
  const handleEditRecord = (record: EducationRecord) => {
    setCurrentRecord(record);
    setIsEditing(true);
  };
  
  const handleAddNewRecord = () => {
    setCurrentRecord({
      id: Date.now().toString(),
      degreeType: '',
      institution: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: null,
      gpa: '',
      certificates: [],
      current: false
    });
    setIsEditing(true);
  };
  
  const handleSaveRecord = async () => {
    if (!currentRecord) return;
    
    try {
      // Yeni kayıt mı yoksa mevcut kayıt güncelleme mi?
      const isNewRecord = !educationData.some(rec => rec.id === currentRecord.id);
      
      // API'ye kaydet (gerçek uygulamada)
      // const response = await fetch('/api/student/education', {
      //   method: isNewRecord ? 'POST' : 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'x-user-email': user?.email || ''
      //   },
      //   body: JSON.stringify(currentRecord)
      // });
      
      // Başarılı olduğunu varsayalım
      if (isNewRecord) {
        setEducationData([...educationData, currentRecord]);
      } else {
        setEducationData(educationData.map(rec => 
          rec.id === currentRecord.id ? currentRecord : rec
        ));
      }
      
      setIsEditing(false);
      setCurrentRecord(null);
      
    } catch (error) {
      console.error('Eğitim bilgisi kaydetme hatası:', error);
    }
  };
  
  const handleDeleteRecord = async (id: string) => {
    try {
      // API'den sil (gerçek uygulamada)
      // await fetch(`/api/student/education/${id}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'x-user-email': user?.email || ''
      //   }
      // });
      
      // Başarılı olduğunu varsayalım
      setEducationData(educationData.filter(rec => rec.id !== id));
      
    } catch (error) {
      console.error('Eğitim bilgisi silme hatası:', error);
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
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#002757]">Eğitim Bilgileri</h1>
            <p className="text-default mt-1">Eğitim geçmişinizi ve sertifikalarınızı buradan yönetebilirsiniz.</p>
          </div>
          
          <button 
            onClick={handleAddNewRecord}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>Yeni Ekle</span>
            <span>+</span>
          </button>
        </div>
        
        {educationData.length === 0 ? (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">Henüz kaydedilmiş eğitim bilginiz bulunmuyor.</p>
            <button 
              onClick={handleAddNewRecord}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Eğitim Bilgisi Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {educationData.map((record) => (
              <motion.div 
                key={record.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#002757] dark:text-blue-300">{record.institution}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{record.degreeType} - {record.fieldOfStudy}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditRecord(record)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Düzenle
                    </button>
                    <button 
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Sil
                    </button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Eğitim Dönemi</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {new Date(record.startDate).toLocaleDateString('tr-TR')} - 
                      {record.current 
                        ? ' Devam Ediyor'
                        : record.endDate ? ` ${new Date(record.endDate).toLocaleDateString('tr-TR')}` : ' Belirtilmemiş'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Not Ortalaması (GPA)</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{record.gpa}</p>
                  </div>
                </div>
                
                {record.certificates && record.certificates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Sertifikalar</p>
                    <div className="flex flex-wrap gap-2">
                      {record.certificates.map((cert, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100/70 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Eğitim Bilgisi Düzenleme Modalı */}
        {isEditing && currentRecord && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-100/60 dark:border-gray-700/30">
                <h2 className="text-2xl font-semibold text-[#002757] dark:text-blue-300 mb-6">
                  {educationData.some(rec => rec.id === currentRecord.id) ? 'Eğitim Bilgisi Düzenle' : 'Yeni Eğitim Bilgisi'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Üniversite / Kurum</label>
                    <input 
                      type="text"
                      value={currentRecord.institution}
                      onChange={(e) => setCurrentRecord({...currentRecord, institution: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Derece</label>
                    <select
                      value={currentRecord.degreeType}
                      onChange={(e) => setCurrentRecord({...currentRecord, degreeType: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90"
                    >
                      <option value="">Derece Seçin</option>
                      <option value="Lise">Lise</option>
                      <option value="Önlisans">Önlisans</option>
                      <option value="Lisans">Lisans</option>
                      <option value="Yüksek Lisans">Yüksek Lisans</option>
                      <option value="Doktora">Doktora</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bölüm</label>
                    <input 
                      type="text"
                      value={currentRecord.fieldOfStudy}
                      onChange={(e) => setCurrentRecord({...currentRecord, fieldOfStudy: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlangıç Tarihi</label>
                      <input 
                        type="date"
                        value={currentRecord.startDate}
                        onChange={(e) => setCurrentRecord({...currentRecord, startDate: e.target.value})}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bitiş Tarihi</label>
                      <input 
                        type="date"
                        value={currentRecord.endDate || ''}
                        onChange={(e) => setCurrentRecord({...currentRecord, endDate: e.target.value})}
                        disabled={currentRecord.current}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90 disabled:bg-gray-100/90 dark:disabled:bg-gray-600/50 disabled:text-gray-500 dark:disabled:text-gray-400"
                      />
                      <div className="mt-1">
                        <label className="flex items-center">
                          <input 
                            type="checkbox"
                            checked={currentRecord.current}
                            onChange={(e) => setCurrentRecord({...currentRecord, current: e.target.checked, endDate: e.target.checked ? null : currentRecord.endDate})}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Eğitimim devam ediyor</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Not Ortalaması (GPA)</label>
                    <input 
                      type="text"
                      value={currentRecord.gpa}
                      onChange={(e) => setCurrentRecord({...currentRecord, gpa: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90"
                      placeholder="Örn: 3.50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sertifikalar (virgülle ayırın)</label>
                    <textarea 
                      value={currentRecord.certificates.join(', ')}
                      onChange={(e) => setCurrentRecord({...currentRecord, certificates: e.target.value.split(',').map(cert => cert.trim()).filter(Boolean)})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90"
                      placeholder="Örn: TOEFL: 95, IELTS: 7.0"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentRecord(null);
                    }}
                    className="px-4 py-2 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300/80 dark:hover:bg-gray-600/80 transition-colors"
                  >
                    İptal
                  </button>
                  <button 
                    onClick={handleSaveRecord}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
} 