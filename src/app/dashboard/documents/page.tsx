"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ProtectedPanel from '@/components/ProtectedPanel';

// Örnek doküman verileri
const documentsData = {
  pendingDocuments: [
    { id: 1, name: "Transkript", type: "pdf", size: "1.2 MB", dueDate: "30 Mayıs 2023" },
    { id: 2, name: "Motivasyon Mektubu", type: "docx", size: "523 KB", dueDate: "15 Mayıs 2023" },
    { id: 3, name: "Finansal Garanti Belgesi", type: "pdf", size: "845 KB", dueDate: "1 Haziran 2023" },
  ],
  uploadedDocuments: [
    { id: 4, name: "Pasaport", type: "pdf", size: "3.1 MB", uploadDate: "10 Mart 2023" },
    { id: 5, name: "Kabul Mektubu", type: "pdf", size: "756 KB", uploadDate: "25 Şubat 2023" },
    { id: 6, name: "Özgeçmiş (CV)", type: "pdf", size: "645 KB", uploadDate: "5 Mart 2023" },
  ]
};

// Dosya türüne göre ikon
const getFileIcon = (type: string) => {
  switch(type.toLowerCase()) {
    case 'pdf':
      return "📄";
    case 'docx':
      return "📝";
    case 'jpg':
    case 'png':
    case 'jpeg':
      return "🖼️";
    default:
      return "📎";
  }
};

export default function DocumentsPanel() {
  return (
    <Layout>
      <ProtectedPanel panelName="Dokümanlar">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#002757]">Dokümanlar</h1>
            <p className="text-default mt-2">
              Başvurunuz için gerekli tüm belgelerinizi bu sayfadan yönetebilirsiniz.
            </p>
          </div>

          {/* Bekleyen Belgeler */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#002757]">Bekleyen Belgeler</h2>
              <span className="bg-yellow-100/70 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm font-medium px-3 py-1 rounded-full">
                {documentsData.pendingDocuments.length} bekleyen belge
              </span>
            </div>
            
            {documentsData.pendingDocuments.length > 0 ? (
              <div className="space-y-3">
                {documentsData.pendingDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200/60 dark:border-gray-700/30 rounded-lg hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                        <span className="text-xl">{getFileIcon(doc.type)}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{doc.type.toUpperCase()} • {doc.size}</p>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-red-600 mb-2">Son Tarih: {doc.dueDate}</div>
                      <button className="btn-primary btn-sm">Yükle</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">Bekleyen belge bulunmamaktadır.</p>
            )}
          </div>

          {/* Yüklenen Belgeler */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#002757]">Yüklenen Belgeler</h2>
              <span className="bg-green-100/70 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium px-3 py-1 rounded-full">
                {documentsData.uploadedDocuments.length} belge yüklendi
              </span>
            </div>
            
            {documentsData.uploadedDocuments.length > 0 ? (
              <div className="space-y-3">
                {documentsData.uploadedDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200/60 dark:border-gray-700/30 rounded-lg hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100/70 dark:bg-green-900/30 text-green-600 dark:text-green-300 flex items-center justify-center mr-3">
                        <span className="text-xl">{getFileIcon(doc.type)}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{doc.type.toUpperCase()} • {doc.size}</p>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Yükleme: {doc.uploadDate}</div>
                      <div className="flex space-x-2">
                        <button className="btn-sm btn-secondary">Görüntüle</button>
                        <button className="btn-sm btn-secondary text-red-600">Sil</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">Henüz yüklenen belge bulunmamaktadır.</p>
            )}
          </div>

          {/* Belge Yükleme İpuçları */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-[#002757] mb-2">Belge Yükleme İpuçları</h3>
            <p className="text-default mb-4">
              Belgelerinizin doğru formatta ve okunaklı olduğundan emin olun. PDF formatı tercih edilir ve dosya boyutu 5MB'ı geçmemelidir.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary">
                Yeni Belge Yükle
              </button>
              <button className="btn-secondary">
                Belge Gereksinimleri
              </button>
            </div>
          </div>
        </motion.div>
      </ProtectedPanel>
    </Layout>
  );
} 