"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

// Dynamic import for chart components to avoid SSR issues
const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), { ssr: false });
const Pie = dynamic(() => import('react-chartjs-2').then((mod) => mod.Pie), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { ssr: false });

// Dynamic import for chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';

// Register the required chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface ReportData {
  studentCountByStatus: {
    active: number;
    pending: number;
    completed: number;
    deferred: number;
  };
  applicationsByUniversity: Record<string, number>;
  applicationsByStatus: {
    draft: number;
    submitted: number;
    in_review: number;
    accepted: number;
    rejected: number;
  };
  documentsCompletionRate: number;
  monthlyActivities: {
    month: string;
    students: number;
    applications: number;
    messages: number;
  }[];
}

export default function AdvisorReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'last30days' | 'last90days' | 'lastYear' | 'all'>('last30days');
  
  useEffect(() => {
    // Rapor verilerini API'den çek
    const fetchReportData = async () => {
      setIsLoading(true);
      
      try {
        if (user) {
          const response = await fetch(`/api/advisor/reports?range=${dateRange}`, {
            headers: {
              'x-user-email': user.email
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setReportData(data);
          } else {
            // API'den veri gelmezse örnek veri
            setReportData({
              studentCountByStatus: {
                active: 12,
                pending: 5,
                completed: 8,
                deferred: 3
              },
              applicationsByUniversity: {
                'Oxford University': 7,
                'Harvard University': 5,
                'ETH Zurich': 4,
                'MIT': 3,
                'Cambridge University': 6
              },
              applicationsByStatus: {
                draft: 6,
                submitted: 9,
                in_review: 7,
                accepted: 5,
                rejected: 3
              },
              documentsCompletionRate: 78,
              monthlyActivities: [
                { month: 'Ocak', students: 3, applications: 5, messages: 45 },
                { month: 'Şubat', students: 4, applications: 6, messages: 52 },
                { month: 'Mart', students: 5, applications: 8, messages: 63 },
                { month: 'Nisan', students: 7, applications: 10, messages: 75 },
                { month: 'Mayıs', students: 8, applications: 14, messages: 89 },
                { month: 'Haziran', students: 10, applications: 15, messages: 95 }
              ]
            });
          }
        }
      } catch (error) {
        console.error('Rapor verisi çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReportData();
  }, [user, dateRange]);
  
  const getStudentStatusData = () => {
    if (!reportData) return { labels: [], datasets: [] };
    
    return {
      labels: ['Aktif', 'Beklemede', 'Tamamlandı', 'Ertelendi'],
      datasets: [
        {
          label: 'Öğrenci Sayısı',
          data: [
            reportData.studentCountByStatus.active,
            reportData.studentCountByStatus.pending,
            reportData.studentCountByStatus.completed,
            reportData.studentCountByStatus.deferred
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 99, 132, 0.7)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  const getApplicationsByUniversityData = () => {
    if (!reportData) return { labels: [], datasets: [] };
    
    const universities = Object.keys(reportData.applicationsByUniversity);
    const counts = Object.values(reportData.applicationsByUniversity);
    
    return {
      labels: universities,
      datasets: [
        {
          label: 'Başvuru Sayısı',
          data: counts,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };
  
  const getApplicationsByStatusData = () => {
    if (!reportData) return { labels: [], datasets: [] };
    
    return {
      labels: ['Taslak', 'Gönderildi', 'İncelemede', 'Kabul Edildi', 'Reddedildi'],
      datasets: [
        {
          label: 'Başvuru Durumu',
          data: [
            reportData.applicationsByStatus.draft,
            reportData.applicationsByStatus.submitted,
            reportData.applicationsByStatus.in_review,
            reportData.applicationsByStatus.accepted,
            reportData.applicationsByStatus.rejected
          ],
          backgroundColor: [
            'rgba(201, 203, 207, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 99, 132, 0.7)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  const getMonthlyActivitiesData = () => {
    if (!reportData) return { labels: [], datasets: [] };
    
    return {
      labels: reportData.monthlyActivities.map(item => item.month),
      datasets: [
        {
          label: 'Öğrenciler',
          data: reportData.monthlyActivities.map(item => item.students),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Başvurular',
          data: reportData.monthlyActivities.map(item => item.applications),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Mesajlar',
          data: reportData.monthlyActivities.map(item => item.messages),
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
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
            <h1 className="text-3xl font-bold text-[#002757]">Raporlar</h1>
            <p className="text-default mt-1">Danışmanlığını yaptığınız öğrencilerin istatistikleri ve raporları.</p>
          </div>
          
          <div>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="last30days">Son 30 Gün</option>
              <option value="last90days">Son 90 Gün</option>
              <option value="lastYear">Son 1 Yıl</option>
              <option value="all">Tüm Zamanlar</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Öğrenci Durum Dağılımı</h2>
            <div className="h-80">
              {reportData && <Pie data={getStudentStatusData()} options={{
                responsive: true,
                maintainAspectRatio: false
              }} />}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Başvuru Durum Dağılımı</h2>
            <div className="h-80">
              {reportData && <Pie data={getApplicationsByStatusData()} options={{
                responsive: true,
                maintainAspectRatio: false
              }} />}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md md:col-span-2"
          >
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Üniversite Bazlı Başvurular</h2>
            <div className="h-80">
              {reportData && <Bar data={getApplicationsByUniversityData()} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  }
                }
              }} />}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md md:col-span-2"
          >
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Aylık Aktiviteler</h2>
            <div className="h-80">
              {reportData && <Line data={getMonthlyActivitiesData()} options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} />}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md md:col-span-2"
          >
            <h2 className="text-xl font-semibold text-[#002757] mb-4">Genel İstatistikler</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm text-blue-600 font-medium">Toplam Aktif Öğrenci</h3>
                <p className="text-3xl font-bold mt-2">{reportData?.studentCountByStatus.active || 0}</p>
                <p className="text-sm text-blue-800 mt-1">Toplam öğrencilerin {reportData ? Math.round((reportData.studentCountByStatus.active / (reportData.studentCountByStatus.active + reportData.studentCountByStatus.pending + reportData.studentCountByStatus.completed + reportData.studentCountByStatus.deferred)) * 100) : 0}%'i</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm text-green-600 font-medium">Kabul Edilen Başvurular</h3>
                <p className="text-3xl font-bold mt-2">{reportData?.applicationsByStatus.accepted || 0}</p>
                <p className="text-sm text-green-800 mt-1">Toplam başvuruların {reportData ? Math.round((reportData.applicationsByStatus.accepted / (reportData.applicationsByStatus.draft + reportData.applicationsByStatus.submitted + reportData.applicationsByStatus.in_review + reportData.applicationsByStatus.accepted + reportData.applicationsByStatus.rejected)) * 100) : 0}%'i</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-sm text-yellow-600 font-medium">Değerlendirmede Olan Başvurular</h3>
                <p className="text-3xl font-bold mt-2">{reportData?.applicationsByStatus.in_review || 0}</p>
                <p className="text-sm text-yellow-800 mt-1">Toplam başvuruların {reportData ? Math.round((reportData.applicationsByStatus.in_review / (reportData.applicationsByStatus.draft + reportData.applicationsByStatus.submitted + reportData.applicationsByStatus.in_review + reportData.applicationsByStatus.accepted + reportData.applicationsByStatus.rejected)) * 100) : 0}%'i</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm text-purple-600 font-medium">Doküman Tamamlanma Oranı</h3>
                <p className="text-3xl font-bold mt-2">%{reportData?.documentsCompletionRate || 0}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${reportData?.documentsCompletionRate || 0}%` }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
} 