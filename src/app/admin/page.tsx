"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Animasyon varyantları
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  advisor?: string;
  status: string;
  stage?: string;
  processStarted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Advisor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  studentCount: number;
  updatedAt?: string;
}

export default function StudentsPage() {
  console.log('🔄 StudentsPage component render edildi');
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAssignAdvisorModal, setShowAssignAdvisorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({ name: "", email: "", phone: "" });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Component mount olduğunda verileri getir
  useEffect(() => {
    console.log('🚀 useEffect çalıştı');
    
    const fetchData = async () => {
      console.log('📡 Veriler getiriliyor...');
      setIsLoading(true);
      
      try {
        // Öğrencileri getir
        const studentsResponse = await fetch('/api/admin/students', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          console.log('✅ Öğrenciler alındı:', studentsData);
          setStudents(studentsData.students || []);
        } else {
          console.error('❌ Öğrenciler alınamadı:', studentsResponse.status);
          toast({
            title: "Hata",
            description: "Öğrenci listesi alınamadı.",
            variant: "destructive"
          });
        }
        
        // Danışmanları getir
        const advisorsResponse = await fetch('/api/admin/advisors', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (advisorsResponse.ok) {
          const advisorsData = await advisorsResponse.json();
          console.log('✅ Danışmanlar alındı:', advisorsData);
          setAdvisors(advisorsData.advisors || []);
        } else {
          console.error('❌ Danışmanlar alınamadı:', advisorsResponse.status);
        }
        
      } catch (error) {
        console.error('❌ Veri getirme hatası:', error);
        toast({
          title: "Hata",
          description: "Veriler alınırken bir hata oluştu.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Modal'ı kapatma fonksiyonları
  const closeAddStudentModal = () => {
    setShowAddStudentModal(false);
    setNewStudent({ name: "", email: "", phone: "" });
    setIsSubmitting(false);
  };

  const closeAssignAdvisorModal = () => {
    setShowAssignAdvisorModal(false);
    setSelectedStudent(null);
    setSelectedAdvisor(null);
    setIsSubmitting(false);
  };

  const closeEditStudentModal = () => {
    setShowEditStudentModal(false);
    setEditingStudent(null);
    setIsSubmitting(false);
  };

  const closeStudentDetailsModal = () => {
    setShowStudentDetailsModal(false);
    setSelectedStudent(null);
    setStudentDetails(null);
  };
  
  // Öğrenci ekleme işlemi
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email) {
      toast({
        title: "Hata",
        description: "Ad ve e-posta alanları zorunludur.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Başarılı",
          description: "Öğrenci başarıyla eklendi.",
        });
        
        // Yeni öğrenciyi listeye ekle
        setStudents(prev => [result.student, ...prev]);
        closeAddStudentModal();
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.error || "Öğrenci eklenirken bir hata oluştu.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Öğrenci ekleme hatası:', error);
      toast({
        title: "Hata",
        description: "Öğrenci eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Danışman atama işlemi
  const handleAssignAdvisor = async () => {
    if (!selectedStudent || !selectedAdvisor) {
      toast({
        title: "Hata",
        description: "Öğrenci ve danışman seçimi zorunludur.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/assign-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail: selectedStudent.email,
          advisorEmail: selectedAdvisor.email
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Danışman başarıyla atandı.",
        });
        
        // Öğrenci listesini güncelle
        setStudents(prev => prev.map(s => 
          s.email === selectedStudent.email 
            ? { ...s, advisor: selectedAdvisor.name }
            : s
        ));
        
        closeAssignAdvisorModal();
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.error || "Danışman atanırken bir hata oluştu.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Danışman atama hatası:', error);
      toast({
        title: "Hata",
        description: "Danışman atanırken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
      
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.advisor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aktif':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/40 text-success-800 dark:text-success-300">
            Aktif
          </span>
        );
      case 'Beklemede':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/40 text-warning-800 dark:text-warning-300">
            Beklemede
          </span>
        );
      case 'Tamamlandı':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300">
            Tamamlandı
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  // İstatistikler
  const totalStudents = students.length;
  const unassignedStudents = students.filter(s => s.advisor === "Atanmadı").length;
  const activeStudents = students.filter(s => s.status === "Aktif").length;
  const completedStudents = students.filter(s => s.status === "Tamamlandı").length;

  // Öğrenci detaylarını getir
  const fetchStudentDetails = async (email: string) => {
    try {
      setIsLoadingDetails(true);
      
      const response = await fetch(`/api/student/${email}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudentDetails(data.student || data);
      } else {
        console.error('Öğrenci detayları alınamadı:', response.status);
        toast({
          title: "Hata",
          description: "Öğrenci detayları alınırken bir hata oluştu.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Öğrenci detayları getirme hatası:', error);
      toast({
        title: "Hata",
        description: "Öğrenci detayları alınırken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Öğrenci düzenleme işlemi
  const handleEditStudent = async () => {
    if (!editingStudent || !editingStudent.name || !editingStudent.email) {
      toast({
        title: "Hata",
        description: "Ad ve e-posta alanları zorunludur.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/students/${editingStudent.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingStudent),
      });
      
      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Öğrenci başarıyla güncellendi.",
        });
        
        // Öğrenci listesini güncelle
        setStudents(prev => prev.map(s => 
          s.email === editingStudent.email ? editingStudent : s
        ));
        
        closeEditStudentModal();
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.error || "Öğrenci güncellenirken bir hata oluştu.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Öğrenci güncelleme hatası:', error);
      toast({
        title: "Hata",
        description: "Öğrenci güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Başlık */}
          <div className="relative overflow-hidden mb-8">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-100/50 dark:bg-primary-900/20 rounded-full blur-2xl"></div>
            <div className="absolute top-10 -left-10 w-40 h-40 bg-secondary-100/30 dark:bg-secondary-900/10 rounded-full blur-xl"></div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-r from-white to-primary-50/70 dark:from-gray-800/80 dark:to-primary-900/20 border border-white/40 dark:border-gray-700/30 shadow-xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Öğrenciler</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Tüm öğrencilerin bilgilerini buradan yönetebilirsiniz.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md rounded-full text-sm font-medium flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Öğrenci
                </Button>
                <Button 
                  onClick={() => setShowAssignAdvisorModal(true)}
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md rounded-full text-sm font-medium flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Danışman Ata
                </Button>
                </div>
              </div>
            </motion.div>
        </div>
        
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            variants={fadeIn}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100/60 dark:border-gray-700/30 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Öğrenci</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalStudents}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100/60 dark:border-gray-700/30 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Danışman Atanmamış</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{unassignedStudents}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning-600 dark:text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100/60 dark:border-gray-700/30 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Öğrenci</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{activeStudents}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
        </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100/60 dark:border-gray-700/30 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tamamlanan</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{completedStudents}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </motion.div>
          </div>
          
        {/* Arama */}
        <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
            placeholder="Öğrenci ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full sm:w-64 text-gray-800 dark:text-gray-200 rounded-lg"
                />
              </div>
              
        {/* Tablo */}
        <motion.div
          variants={fadeIn}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 overflow-hidden"
                    >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-700 dark:text-gray-300">Ad Soyad</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">E-posta</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Telefon</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Danışman</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Durum</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
            {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Öğrenci Bulunamadı
                    </TableCell>
                  </TableRow>
                        ) : (
                          filteredStudents.map((student) => (
                    <TableRow key={student.id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors">
                      <TableCell>
                                <div className="flex items-center">
                          <div className="relative group-hover:scale-105 transition-transform">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full blur-[1px]"></div>
                                    <div className="relative h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900 dark:to-accent-900 border-2 border-white dark:border-gray-800 font-medium text-gray-800 dark:text-gray-200">
                                      {student.name.charAt(0)}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {student.name}
                                  </div>
                                </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        <a href={`mailto:${student.email}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                {student.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {student.phone ? (
                          <a href={`tel:${student.phone.replace(/[^0-9]/g, '')}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                {student.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">Belirtilmemiş</span>
                        )}
                      </TableCell>
                      <TableCell>
                                {student.advisor === "Atanmadı" ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/40 text-warning-800 dark:text-warning-300">
                                    Atanmadı
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/40 text-success-800 dark:text-success-300">
                                    {student.advisor}
                                  </span>
                                )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(student.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingStudent(student);
                              setShowEditStudentModal(true);
                            }}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 border-primary-200 dark:border-primary-800/30 hover:border-primary-300 dark:hover:border-primary-700/50 bg-primary-50/50 dark:bg-primary-900/20 hover:bg-primary-100/50 dark:hover:bg-primary-800/30"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                                  Düzenle
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowStudentDetailsModal(true);
                              fetchStudentDetails(student.email);
                            }}
                            className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300 border-secondary-200 dark:border-secondary-800/30 hover:border-secondary-300 dark:hover:border-secondary-700/50 bg-secondary-50/50 dark:bg-secondary-900/20 hover:bg-secondary-100/50 dark:hover:bg-secondary-800/30"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            Detaylar
                          </Button>
                              </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
              </div>
        </motion.div>
        
        {/* Yeni Öğrenci Modal */}
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeAddStudentModal}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Yeni Öğrenci Ekle
                </h2>
                <button 
                  onClick={closeAddStudentModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

          <div className="space-y-4">
            <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Ad Soyad</Label>
              <Input
                    id="name" 
                value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="mt-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">E-posta</Label>
              <Input
                    id="email" 
                type="email"
                value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    className="mt-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
                  <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Telefon</Label>
              <Input
                    id="phone" 
                value={newStudent.phone}
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                    className="mt-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

              <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleAddStudent} 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg"
              disabled={isSubmitting}
            >
                  {isSubmitting ? "Ekleniyor..." : "Öğrenci Ekle"}
            </Button>
            </div>
            </div>
            </div>
        )}

        {/* Danışman Atama Modal */}
        {showAssignAdvisorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeAssignAdvisorModal}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Danışman Ata
                </h2>
                <button
                  onClick={closeAssignAdvisorModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                </div>

          <div className="space-y-4">
            <div>
                  <Label htmlFor="student-select" className="text-gray-700 dark:text-gray-300">Öğrenci</Label>
              <Select
                    value={selectedStudent?.email}
                    onValueChange={(value: string) => {
                      const student = students.find(s => s.email === value);
                      setSelectedStudent(student || null);
                    }}
                  >
                    <SelectTrigger className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <SelectValue placeholder="Öğrenci seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
                      {students.map((student) => (
                        <SelectItem 
                          key={student.email} 
                          value={student.email}
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                        >
                          {student.name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
            </div>

            <div>
                  <Label htmlFor="advisor-select" className="text-gray-700 dark:text-gray-300">Danışman</Label>
              <Select
                    value={selectedAdvisor?.id}
                    onValueChange={(value: string) => {
                      const advisor = advisors.find(a => a.id === value);
                      setSelectedAdvisor(advisor || null);
                    }}
                  >
                    <SelectTrigger className="mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <SelectValue placeholder="Danışman seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
                      {advisors.map((advisor) => (
                        <SelectItem 
                          key={advisor.id} 
                          value={advisor.id}
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                        >
                          {advisor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
            </div>
          </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  onClick={closeAssignAdvisorModal}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600"
                >
              İptal
            </Button>
            <Button 
              onClick={handleAssignAdvisor}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg"
                  disabled={isSubmitting || !selectedStudent || !selectedAdvisor}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      Atanıyor...
                </div>
                  ) : "Danışman Ata"}
            </Button>
              </div>
            </div>
          </div>
        )}

        {/* Düzenle ve Detaylar Modalları */}
        {showEditStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeEditStudentModal}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Öğrenci Düzenle
                </h2>
                <button
                  onClick={closeEditStudentModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {editingStudent && (
                <div className="space-y-6">
                  {/* Kişisel Bilgiler */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Kişisel Bilgiler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Ad Soyad</Label>
                        <Input
                          id="name" 
                          value={editingStudent.name || ''}
                          onChange={(e) => editingStudent && setEditingStudent({...editingStudent, name: e.target.value})}
                          className="mt-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">E-posta</Label>
                        <Input
                          id="email" 
                          type="email"
                          value={editingStudent.email || ''}
                          onChange={(e) => editingStudent && setEditingStudent({...editingStudent, email: e.target.value})}
                          className="mt-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Telefon</Label>
                        <Input
                          id="phone" 
                          value={editingStudent.phone || ''}
                          onChange={(e) => editingStudent && setEditingStudent({...editingStudent, phone: e.target.value})}
                          className="mt-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stage" className="text-gray-700 dark:text-gray-300">Durum</Label>
                        <Select
                          value={editingStudent.stage || ''}
                          onValueChange={(value) => editingStudent && setEditingStudent({...editingStudent, stage: value})}
                        >
                          <SelectTrigger className="mt-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                            <SelectValue placeholder="Durum seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hazırlık Aşaması">Hazırlık Aşaması</SelectItem>
                            <SelectItem value="Süreç Başlatıldı">Süreç Başlatıldı</SelectItem>
                            <SelectItem value="İşlemde">İşlemde</SelectItem>
                            <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  onClick={closeEditStudentModal}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600"
                >
                  İptal
                </Button>
                <Button 
                  onClick={handleEditStudent} 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg"
                  disabled={isSubmitting || !editingStudent}
                >
                  {isSubmitting ? "Güncelleniyor..." : "Öğrenci Güncelle"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showStudentDetailsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeStudentDetailsModal}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Öğrenci Detayları
                </h2>
                <button
                  onClick={closeStudentDetailsModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Yükleniyor...</span>
                </div>
              ) : studentDetails ? (
                <div className="space-y-6">
                  {/* Kişisel Bilgiler */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Kişisel Bilgiler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Ad Soyad</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.name || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">E-posta</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.email || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Telefon</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.phone || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Doğum Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.birthDate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Doğum Yeri</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.birthPlace || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Medeni Durum</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.maritalStatus || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">İletişim Adresi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.contactAddress || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Durum</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.stage || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pasaport Bilgileri */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Pasaport Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Pasaport Numarası</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.passportNumber || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Pasaport Türü</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.passportType || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Veriliş Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.passportIssueDate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Geçerlilik Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.passportExpiryDate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Veren Makam</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.issuingAuthority || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">PNR Numarası</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.pnrNumber || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Anne Bilgileri */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Anne Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Ad</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.motherName || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Soyad</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.motherSurname || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Doğum Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.motherBirthDate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Doğum Yeri</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.motherBirthPlace || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">İkamet</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.motherResidence || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Telefon</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.motherPhone || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Baba Bilgileri */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Baba Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Ad</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.fatherName || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Soyad</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.fatherSurname || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Doğum Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.fatherBirthDate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Doğum Yeri</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.fatherBirthPlace || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">İkamet</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.fatherResidence || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Telefon</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.fatherPhone || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Eğitim Bilgileri */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Eğitim Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Lise Adı</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.highSchoolName || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Lise Türü</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.highSchoolType || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Lise Şehri</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.highSchoolCity || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Lise Başlangıç Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.highSchoolStartDate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Lise Bitiş Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.highSchoolGraduationDate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Üniversite Adı</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.universityName || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Üniversite Bölümü</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.universityDepartment || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Üniversite Başlangıç Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.universityStartDate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Üniversite Bitiş Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.universityEndDate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Mezuniyet Durumu</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.graduationStatus || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Mezuniyet Yılı</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.graduationYear || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Almanya Bölüm Tercihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.germanDepartmentPreference || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dil Bilgileri */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Dil Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Almanca Seviyesi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.languageLevel || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Almanca Sertifikası</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.languageCertificate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Dil Öğrenim Durumu</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.languageLearningStatus || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vize Bilgileri */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Vize Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Konsolosluk</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.visaConsulate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Vize Başvuru Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.visaApplicationDate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Vize Randevu Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.visaAppointmentDate || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Vize Belgesi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.visaDocument || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Finansal Bilgiler */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Finansal Bilgiler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Finansal Kanıt</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.financialProof || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Finansal Kanıt Durumu</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.financialProofStatus || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sınav Bilgileri */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Sınav Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Sınav Girişi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.examEntry ? "Evet" : "Hayır"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-gray-400 text-sm">Sınav Sonuç Tarihi</Label>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{studentDetails.examResultDate || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Öğrenci detayları yüklenemedi.
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={closeStudentDetailsModal}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg"
                >
                  Kapat
            </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
} 