"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  university?: string;
  program?: string;
  status: 'active' | 'pending' | 'completed' | 'deferred';
  lastActivity: string;
  processStep: number;
  applicationCount: number;
  documentsCount: number;
  documentsRequired: number;
  profilePic?: string;
}

export default function AdvisorStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Student['status'] | 'all'>('all');
  
  useEffect(() => {
    // Öğrenci verilerini API'den çek
    const fetchStudents = async () => {
      setIsLoading(true);
      
      try {
        if (user) {
          const response = await fetch('/api/advisor/students', {
            headers: {
              'x-user-email': user.email
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setStudents(data.students || []);
            setFilteredStudents(data.students || []);
          } else {
            // API'den veri gelmezse örnek veri
            const mockStudents: Student[] = [
              {
                id: 'std1',
                name: 'Ahmet Yılmaz',
                email: 'ahmet.yilmaz@example.com',
                phone: '+90 555 123 4567',
                university: 'Oxford University',
                program: 'Business Administration',
                status: 'active',
                lastActivity: '2023-06-10',
                processStep: 3,
                applicationCount: 2,
                documentsCount: 5,
                documentsRequired: 8,
                profilePic: 'https://placehold.co/100x100/ffc105/002757?text=AY'
              },
              {
                id: 'std2',
                name: 'Zeynep Kaya',
                email: 'zeynep.kaya@example.com',
                phone: '+90 555 987 6543',
                university: 'Harvard University',
                program: 'Computer Science',
                status: 'pending',
                lastActivity: '2023-06-08',
                processStep: 1,
                applicationCount: 0,
                documentsCount: 2,
                documentsRequired: 8,
                profilePic: 'https://placehold.co/100x100/ffc105/002757?text=ZK'
              },
              {
                id: 'std3',
                name: 'Mehmet Demir',
                email: 'mehmet.demir@example.com',
                phone: '+90 555 456 7890',
                status: 'completed',
                lastActivity: '2023-06-01',
                processStep: 5,
                applicationCount: 3,
                documentsCount: 8,
                documentsRequired: 8,
                university: 'ETH Zurich',
                program: 'Mechanical Engineering',
                profilePic: 'https://placehold.co/100x100/ffc105/002757?text=MD'
              },
              {
                id: 'std4',
                name: 'Ayşe Şahin',
                email: 'ayse.sahin@example.com',
                phone: '+90 555 321 7654',
                status: 'deferred',
                lastActivity: '2023-05-15',
                processStep: 2,
                applicationCount: 1,
                documentsCount: 3,
                documentsRequired: 8,
                profilePic: 'https://placehold.co/100x100/ffc105/002757?text=AŞ'
              }
            ];
            
            setStudents(mockStudents);
            setFilteredStudents(mockStudents);
          }
        }
      } catch (error) {
        console.error('Öğrenci verisi çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudents();
  }, [user]);
  
  // Arama ve filtreleme işlevi
  useEffect(() => {
    let result = students;
    
    // Durum filtreleme
    if (filterStatus !== 'all') {
      result = result.filter(student => student.status === filterStatus);
    }
    
    // Arama sorgusu filtreleme
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(student => 
        student.name.toLowerCase().includes(query) || 
        student.email.toLowerCase().includes(query) ||
        (student.university && student.university.toLowerCase().includes(query)) ||
        (student.program && student.program.toLowerCase().includes(query))
      );
    }
    
    setFilteredStudents(result);
  }, [searchQuery, filterStatus, students]);
  
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewingDetails(true);
  };
  
  const getStatusText = (status: Student['status']) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'pending': return 'Beklemede';
      case 'completed': return 'Tamamlandı';
      case 'deferred': return 'Ertelendi';
      default: return status;
    }
  };
  
  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'deferred': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getProcessStepText = (step: number) => {
    switch (step) {
      case 0: return 'Başlamadı';
      case 1: return 'Profil Oluşturma';
      case 2: return 'Doküman Toplama';
      case 3: return 'Başvuru Hazırlığı';
      case 4: return 'Başvuru Değerlendirme';
      case 5: return 'Süreç Tamamlandı';
      default: return `Adım ${step}`;
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
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#002757]">Öğrencilerim</h1>
            <p className="text-default mt-1">Danışmanlığını yaptığınız öğrencilerin listesi ve detayları.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <input 
                type="text"
                placeholder="Öğrenci ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Student['status'] | 'all')}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="pending">Beklemede</option>
              <option value="completed">Tamamlandı</option>
              <option value="deferred">Ertelendi</option>
            </select>
          </div>
        </div>
        
        {filteredStudents.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-lg text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? 'Arama kriterlerine uygun öğrenci bulunamadı.' 
                : 'Henüz atanmış öğrenciniz bulunmuyor.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öğrenci</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Süreç</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Aktivite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover"
                            src={student.profilePic || `https://placehold.co/100x100/ffc105/002757?text=${student.name.charAt(0)}`}
                            alt={student.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#002757]">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            {student.university ? (
                              <>
                                {student.university}
                                {student.program && <span> • {student.program}</span>}
                              </>
                            ) : (
                              <span className="text-gray-400">Henüz üniversite seçilmedi</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.status)}`}>
                        {getStatusText(student.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getProcessStepText(student.processStep)}</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(student.processStep / 5) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.lastActivity).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewStudent(student)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Detaylar
                      </button>
                      <Link
                        href={`/advisor/messages?student=${student.email}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Mesaj
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Öğrenci Detayları Modalı */}
        {isViewingDetails && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-4">
                  <img 
                    src={selectedStudent.profilePic || `https://placehold.co/100x100/ffc105/002757?text=${selectedStudent.name.charAt(0)}`}
                    alt={selectedStudent.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-[#002757]">{selectedStudent.name}</h2>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                    <p className="text-gray-600">{selectedStudent.phone}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsViewingDetails(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-[#002757] mb-1">Durum</h3>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedStudent.status)}`}>
                    {getStatusText(selectedStudent.status)}
                  </span>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-[#002757] mb-1">Süreç Adımı</h3>
                  <p>{getProcessStepText(selectedStudent.processStep)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(selectedStudent.processStep / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-[#002757] mb-1">Son Aktivite</h3>
                  <p>{new Date(selectedStudent.lastActivity).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-[#002757] mb-3 pb-2 border-b">Eğitim Bilgileri</h3>
                  {selectedStudent.university ? (
                    <div>
                      <p><span className="font-medium">Üniversite:</span> {selectedStudent.university}</p>
                      {selectedStudent.program && (
                        <p><span className="font-medium">Program:</span> {selectedStudent.program}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Henüz üniversite bilgisi yok</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-[#002757] mb-3 pb-2 border-b">Başvuru & Döküman Özeti</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Başvurular:</span> {selectedStudent.applicationCount} adet
                    </p>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Dökümanlar:</span> 
                        <span>{selectedStudent.documentsCount} / {selectedStudent.documentsRequired}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${selectedStudent.documentsCount === selectedStudent.documentsRequired ? 'bg-green-600' : 'bg-yellow-600'}`} 
                          style={{ width: `${(selectedStudent.documentsCount / selectedStudent.documentsRequired) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <Link
                  href={`/advisor/messages?student=${selectedStudent.email}`}
                  className="px-4 py-2 bg-[#002757] text-white rounded-lg hover:bg-opacity-90"
                >
                  Mesaj Gönder
                </Link>
                <button 
                  onClick={() => setIsViewingDetails(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
} 