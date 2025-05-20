"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useStudentDetail } from '@/hooks/useStudents';

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Belge tipi seçenekleri
const documentTypes = [
  { value: 'kabul_belgesi', label: 'Kabul Belgesi' },
  { value: 'vize_onay', label: 'Vize Onayı' },
  { value: 'pasaport', label: 'Pasaport' },
  { value: 'dil_sertifikasi', label: 'Dil Sertifikası' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'cv', label: 'CV' },
  { value: 'motivasyon_mektubu', label: 'Motivasyon Mektubu' },
  { value: 'diger', label: 'Diğer' },
];

export default function StudentDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdvisor } = useAuth();
  
  // URL'den öğrenci email'ini al
  const studentEmail = typeof params.email === 'string' ? decodeURIComponent(params.email) : '';
  
  // Öğrenci detaylarını çek
  const { student, isLoading, isError, mutate } = useStudentDetail(studentEmail);
  
  // Yeni belge ekleme durumu
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    documentType: '',
    documentName: '',
    documentUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  
  // Formu sıfırla
  const resetForm = () => {
    setFormData({
      documentType: '',
      documentName: '',
      documentUrl: ''
    });
  };
  
  // Form gönderildiğinde
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!formData.documentType || !formData.documentName || !formData.documentUrl) {
      setToast({
        show: true,
        message: 'Lütfen tüm alanları doldurun.',
        type: 'error'
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Gerçek uygulamada API çağrısı yapılır
      // Şu anda mock
      const mockResult = {
        success: true,
        message: 'Belge başarıyla eklendi'
      };
      
      // API başarılı cevap verirse
      if (mockResult.success) {
        setToast({
          show: true,
          message: 'Belge başarıyla eklendi.',
          type: 'success'
        });
        resetForm();
        setShowForm(false);
        
        // Veriyi yenile
        await mutate();
      } else {
        throw new Error('Belge eklenirken bir hata oluştu.');
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Belge eklenirken bir hata oluştu.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Erişim kontrolü
  if (!user || !isAdvisor()) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
            <p className="mb-4">Bu sayfaya erişmek için danışman olarak giriş yapmalısınız.</p>
            <Link href="/login" className="btn-primary">
              Giriş Sayfasına Dön
            </Link>
          </div>
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
        {/* Üst başlık ve geri butonu */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <button 
              onClick={() => router.back()} 
              className="text-blue-600 mb-2 flex items-center hover:underline"
            >
              <span className="mr-1">←</span> Geri
            </button>
            <h1 className="text-3xl font-bold text-[#002757]">
              Öğrenci Belgeleri
            </h1>
            {student && student.name && (
              <p className="text-xl text-[#ff9900] font-medium mt-1">
                {student.name}
              </p>
            )}
          </div>
          
          <button
            onClick={() => {
              setShowForm(!showForm);
              resetForm();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <span className="text-lg">{showForm ? '✕' : '+'}</span>
            <span>{showForm ? 'İptal' : 'Yeni Belge Ekle'}</span>
          </button>
        </div>
        
        {/* Bilgi mesajı */}
        {toast && (
          <div className={`p-4 mb-6 rounded-md ${
            toast.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {toast.message}
          </div>
        )}
        
        {/* Yeni belge formu */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-lg shadow-md mb-6"
          >
            <h2 className="text-xl font-semibold mb-4 text-[#002757] border-b pb-2">
              Yeni Belge Ekle
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Belge Tipi <span className="text-red-500">*</span>
                </label>
                <select
                  id="documentType"
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Belge Tipi Seçin</option>
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="documentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Belge Adı <span className="text-red-500">*</span>
                </label>
                <input
                  id="documentName"
                  type="text"
                  value={formData.documentName}
                  onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Belge adını girin"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="documentUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Belge Bağlantısı <span className="text-red-500">*</span>
                </label>
                <input
                  id="documentUrl"
                  type="url"
                  value={formData.documentUrl}
                  onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="https://drive.google.com/..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Google Drive, Dropbox veya herhangi bir bulut depolama URL'i ekleyebilirsiniz.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Ekleniyor...' : 'Belgeyi Ekle'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
        
        {/* Yükleniyor durumu */}
        {isLoading && (
          <div className="py-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-500">Belgeler yükleniyor...</span>
          </div>
        )}
        
        {/* Hata durumu */}
        {isError && (
          <div className="bg-red-50 text-red-800 p-6 rounded-md">
            <p className="font-medium">Belgeler yüklenirken bir hata oluştu.</p>
            <p className="mt-2">Lütfen internet bağlantınızı kontrol edip tekrar deneyin.</p>
          </div>
        )}
        
        {/* Öğrenci bulunamadıysa */}
        {!isLoading && !isError && !student && (
          <div className="bg-yellow-50 text-yellow-800 p-6 rounded-md">
            <p className="font-medium">Öğrenci bulunamadı.</p>
            <p className="mt-2">Belirtilen e-posta adresine sahip bir öğrenci kaydı bulunamadı.</p>
          </div>
        )}
        
        {/* Belge listesi */}
        {!isLoading && !isError && student && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Belge yoksa */}
            {(!student.documents || student.documents.length === 0) && (
              <div className="bg-gray-50 p-10 rounded-lg text-center">
                <p className="text-gray-600 mb-2">Bu öğrenciye ait belge bulunmamaktadır.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-blue-600 hover:underline"
                >
                  İlk belgeyi eklemek için tıklayın
                </button>
              </div>
            )}
            
            {/* Belge listesi */}
            {student.documents && student.documents.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Yüklenen Belgeler ({student.documents.length})</h3>
                
                <div className="space-y-4">
                  {student.documents.map((doc: any, index: number) => (
                    <motion.div
                      key={`${doc.documentType}-${index}`}
                      variants={itemVariants}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-blue-700">{doc.documentName}</h4>
                          <p className="text-sm text-gray-600 mt-1">{getDocumentTypeName(doc.documentType)}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Eklenme: {new Date(doc.updatedAt).toLocaleDateString('tr-TR')}
                            {doc.uploadedByRole === 'advisor' ? ' (Danışman tarafından)' : ''}
                          </p>
                        </div>
                        <div>
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors font-medium text-sm inline-flex items-center"
                          >
                            <span className="mr-1">📄</span> Görüntüle
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
}

// Belge tipinin adını döndüren yardımcı fonksiyon
function getDocumentTypeName(type: string): string {
  const doc = documentTypes.find(d => d.value === type);
  return doc ? doc.label : 'Diğer';
} 