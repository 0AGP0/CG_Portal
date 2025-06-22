"use client";

import React from 'react';
import Layout from '@/components/Layout';
import { DocumentProvider } from '@/context/DocumentContext';
import { DocumentUpload } from '@/components/DocumentUpload';

export default function DocumentsPage() {
  // Test için öğrenci tipini sabit olarak belirliyoruz
  const studentType = 'UNIVERSITY_STUDENT';

  return (
    <Layout>
      <DocumentProvider>
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#002757]">Belgelerim</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Başvuru süreciniz için gerekli belgeler aşama aşama size gösterilecektir.
                Her aşamada istenen belgeleri eksiksiz ve doğru bir şekilde yüklemeniz önemlidir.
              </p>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30">
            <DocumentUpload studentType={studentType} />
          </div>
        </div>
      </DocumentProvider>
    </Layout>
  );
} 