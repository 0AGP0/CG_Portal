"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

// Stil yardımcı fonksiyonu
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

// UI Bileşenleri
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

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

// İstatistik Kartı Bileşeni
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: "up" | "down" | "neutral" };
  color: "primary" | "secondary" | "accent" | "success" | "warning" | "danger";
  delay?: number;
}

const StatCard = ({ title, value, icon, trend, color, delay = 0 }: StatCardProps) => {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
    secondary: "bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300",
    accent: "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",
    success: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
    warning: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
    danger: "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300",
  };

  const trendColorClasses = {
    up: "text-success-600 dark:text-success-400",
    down: "text-danger-600 dark:text-danger-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className="w-full"
    >
      <div className={cn("rounded-xl border border-gray-100 dark:border-gray-700/30 p-6 h-full flex flex-col justify-between bg-white dark:bg-gray-800/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow")}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-gray-100">{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                <span className={trendColorClasses[trend.label]}>
                  {trend.label === "up" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : trend.label === "down" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                    </svg>
                  )}
                </span>
                <span className={cn("text-sm ml-1", trendColorClasses[trend.label])}>
                  {trend.value}% {trend.label === "up" ? "artış" : trend.label === "down" ? "azalış" : "değişim yok"}
                </span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", colorClasses[color])}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Input bileşeni
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { className?: string }>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={cn("border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500", className)} {...props} />
  )
);
Input.displayName = "Input";

// Button bileşeni
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "default" | "outline" | "secondary"; 
  size?: "default" | "sm" | "lg";
  className?: string;
}>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200"
    };
    
    const sizeStyles = {
      default: "h-10 py-2 px-4",
      sm: "h-8 py-1 px-3 text-sm",
      lg: "h-12 py-3 px-6 text-lg"
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Label bileşeni
const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }>(
  ({ className = "", ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-medium text-gray-700", className)} {...props} />
  )
);
Label.displayName = "Label";

// Table bileşenleri
const Table = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className="overflow-x-auto">
    <table className={cn("w-full border-collapse", className)}>{children}</table>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">{children}</thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="divide-y divide-gray-200">{children}</tbody>
);

const TableRow = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <tr className={cn("hover:bg-gray-50", className)}>{children}</tr>
);

const TableHead = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", className)}>{children}</th>
);

const TableCell = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <td className={cn("px-6 py-4 whitespace-nowrap text-sm", className)}>{children}</td>
);

// Modal/Dialog bileşenleri
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-auto shadow-xl transform transition-all">
          {children}
        </div>
      </div>
    </div>
  );
};

const ModalHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">
    <h3 className="text-lg font-medium text-gray-900">{children}</h3>
  </div>
);

const ModalFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-6 flex justify-end space-x-3">{children}</div>
);

// Select bileşeni
interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

const Select = ({ label, value, onChange, options, placeholder = "Seçiniz...", className = "" }: SelectProps) => {
  return (
    <div className={className}>
      {label && <Label className="mb-1">{label}</Label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Ana sayfa bileşeni
export default function AdminPage() {
  // Durum yönetimi
  const [activeTab, setActiveTab] = useState<"students" | "advisors">("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form durumları
  const [newStudent, setNewStudent] = useState({ name: "", email: "", phone: "" });
  const [newAdvisor, setNewAdvisor] = useState({ name: "", email: "", phone: "" });
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  
  // Toast bildirimi
  const [toast, setToast] = useState({
    open: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "error" | "warning",
  });
  
  // Veri durumları
  const [students, setStudents] = useState<any[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);
  
  // Veri yükleme
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Öğrenci verilerini getir
        const studentsResponse = await fetch('/api/admin/students');
        
        // Danışman verilerini getir
        const advisorsResponse = await fetch('/api/admin/advisors');
        
        if (studentsResponse.ok) {
          const data = await studentsResponse.json();
          setStudents(data.students || []);
        } else {
          console.error('Öğrenci verisi getirme hatası:', studentsResponse.status);
          // API çalışmazsa örnek veri kullan
          setStudents([
            { id: "1", name: "Ahmet Yılmaz", email: "ahmet@example.com", phone: "532-111-2233", advisor: "Müge Hanım" },
            { id: "2", name: "Ayşe Demir", email: "ayse@example.com", phone: "535-222-3344", advisor: "Atanmadı" },
            { id: "3", name: "Mehmet Kaya", email: "mehmet@example.com", phone: "542-333-4455", advisor: "Murat Bey" },
            { id: "4", name: "Zeynep Şahin", email: "zeynep@example.com", phone: "545-444-5566", advisor: "Atanmadı" },
            { id: "5", name: "Emre Yıldız", email: "emre@example.com", phone: "555-555-6677", advisor: "Müge Hanım" },
          ]);
        }
        
        if (advisorsResponse.ok) {
          const data = await advisorsResponse.json();
          setAdvisors(data.advisors || []);
        } else {
          console.error('Danışman verisi getirme hatası:', advisorsResponse.status);
          // API çalışmazsa örnek veri kullan
          setAdvisors([
            { id: "1", name: "Müge Hanım", email: "muge@campusglobal.com", phone: "533-111-0011", studentCount: 8 },
            { id: "2", name: "Murat Bey", email: "murat@campusglobal.com", phone: "544-222-0022", studentCount: 12 },
            { id: "3", name: "Canan Hanım", email: "canan@campusglobal.com", phone: "566-333-0033", studentCount: 5 },
          ]);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        // Hata durumunda örnek veri kullan
        setStudents([
          { id: "1", name: "Ahmet Yılmaz", email: "ahmet@example.com", phone: "532-111-2233", advisor: "Müge Hanım" },
          { id: "2", name: "Ayşe Demir", email: "ayse@example.com", phone: "535-222-3344", advisor: "Atanmadı" },
        ]);
        
        setAdvisors([
          { id: "1", name: "Müge Hanım", email: "muge@campusglobal.com", phone: "533-111-0011", studentCount: 8 },
          { id: "2", name: "Murat Bey", email: "murat@campusglobal.com", phone: "544-222-0022", studentCount: 12 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Arama filtreleme
  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // İşleyiciler
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email) {
      showToast("Hata", "Lütfen isim ve e-posta alanlarını doldurunuz", "error");
      return;
    }
    
    // E-posta validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStudent.email)) {
      showToast("Hata", "Lütfen geçerli bir e-posta adresi giriniz", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API'ye yeni öğrenci ekleme isteği gönder
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Başarılı yanıt durumunda UI'ı güncelle
        const newId = data.student?.id || `temp-${Date.now()}`;
        const newStudentData = { 
          id: newId, 
          ...newStudent, 
          advisor: "Atanmadı", 
          status: "Beklemede" 
        };
        
        setStudents([...students, newStudentData]);
        setNewStudent({ name: "", email: "", phone: "" });
        setIsStudentModalOpen(false);
        
        showToast("Başarılı", "Öğrenci başarıyla eklendi", "success");
      } else {
        // API hatası durumu
        const errorData = await response.json();
        showToast("Hata", errorData.error || "Beklenmeyen bir hata oluştu", "error");
      }
    } catch (error) {
      console.error('Öğrenci ekleme hatası:', error);
      showToast("Hata", "Öğrenci eklenirken bir sorun oluştu", "error");
      
      // Hata olsa bile kullanıcı deneyimini korumak için UI'ı güncelle
      const newId = String(Date.now());
      setStudents([...students, { id: newId, ...newStudent, advisor: "Atanmadı" }]);
      setNewStudent({ name: "", email: "", phone: "" });
      setIsStudentModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAdvisor = async () => {
    if (!newAdvisor.name || !newAdvisor.email) {
      showToast("Hata", "Lütfen isim ve e-posta alanlarını doldurunuz", "error");
      return;
    }
    
    // E-posta validasyonu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdvisor.email)) {
      showToast("Hata", "Lütfen geçerli bir e-posta adresi giriniz", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API'ye yeni danışman ekleme isteği gönder
      const response = await fetch('/api/admin/advisors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdvisor)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Başarılı yanıt durumunda UI'ı güncelle
        const newId = data.advisor?.id || `temp-${Date.now()}`;
        const newAdvisorData = { 
          id: newId, 
          ...newAdvisor, 
          studentCount: 0 
        };
        
        setAdvisors([...advisors, newAdvisorData]);
        setNewAdvisor({ name: "", email: "", phone: "" });
        setIsAdvisorModalOpen(false);
        
        showToast("Başarılı", "Danışman başarıyla eklendi", "success");
      } else {
        // API hatası durumu
        const errorData = await response.json();
        showToast("Hata", errorData.error || "Beklenmeyen bir hata oluştu", "error");
      }
    } catch (error) {
      console.error('Danışman ekleme hatası:', error);
      showToast("Hata", "Danışman eklenirken bir sorun oluştu", "error");
      
      // Hata olsa bile kullanıcı deneyimini korumak için UI'ı güncelle
      const newId = String(Date.now());
      setAdvisors([...advisors, { id: newId, ...newAdvisor, studentCount: 0 }]);
      setNewAdvisor({ name: "", email: "", phone: "" });
      setIsAdvisorModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignAdvisor = async () => {
    if (!selectedStudent || !selectedAdvisor) {
      showToast("Hata", "Lütfen öğrenci ve danışman seçiniz", "error");
      return;
    }
    
    const student = students.find(s => s.id === selectedStudent);
    const advisor = advisors.find(a => a.id === selectedAdvisor);
    
    if (!student || !advisor) {
      showToast("Hata", "Seçilen öğrenci veya danışman bulunamadı", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API'ye danışman atama isteği gönder
      const response = await fetch('/api/admin/assign-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          advisorId: selectedAdvisor
        })
      });
      
      if (response.ok) {
        // Başarılı yanıt durumunda UI'ı güncelle
        
        // Öğrenciye danışman atama
        const updatedStudents = students.map(s => 
          s.id === selectedStudent ? { ...s, advisor: advisor.name, advisorId: advisor.id } : s
        );
        
        // Danışmanın öğrenci sayısını güncelleme
        const updatedAdvisors = advisors.map(a => 
          a.id === selectedAdvisor ? { ...a, studentCount: a.studentCount + 1 } : a
        );
        
        setStudents(updatedStudents);
        setAdvisors(updatedAdvisors);
        setIsAssignModalOpen(false);
        setSelectedStudent("");
        setSelectedAdvisor("");
        
        showToast("Başarılı", `${student.name} için ${advisor.name} danışman olarak atandı`, "success");
      } else {
        // API hatası durumu
        const errorData = await response.json();
        showToast("Hata", errorData.error || "Beklenmeyen bir hata oluştu", "error");
      }
    } catch (error) {
      console.error('Danışman atama hatası:', error);
      showToast("Hata", "Danışman atanırken bir sorun oluştu", "error");
      
      // Hata olsa bile kullanıcı deneyimini korumak için UI'ı güncelle
      const updatedStudents = students.map(s => 
        s.id === selectedStudent ? { ...s, advisor: advisor.name } : s
      );
      
      const updatedAdvisors = advisors.map(a => 
        a.id === selectedAdvisor ? { ...a, studentCount: a.studentCount + 1 } : a
      );
      
      setStudents(updatedStudents);
      setAdvisors(updatedAdvisors);
      setIsAssignModalOpen(false);
      setSelectedStudent("");
      setSelectedAdvisor("");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const showToast = (title: string, message: string, type: "info" | "success" | "error" | "warning") => {
    setToast({ open: true, title, message, type });
    setTimeout(() => {
      setToast(prevState => ({ ...prevState, open: false }));
    }, 3000);
  };
  
  // Öğrenci ve danışman seçenekleri
  const studentOptions = students
    .filter(s => s.advisor === "Atanmadı")
    .map(s => ({ value: s.id, label: s.name }));
  
  const advisorOptions = advisors.map(a => ({ value: a.id, label: a.name }));

  // İstatistikler
  const totalStudents = students.length;
  const unassignedStudents = students.filter(s => s.advisor === "Atanmadı").length;
  const totalAdvisors = advisors.length;
  const averageStudentPerAdvisor = totalAdvisors > 0 
    ? Math.round((totalStudents - unassignedStudents) / totalAdvisors * 10) / 10
    : 0;

  return (
    <Layout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Başlık */}
        <div>
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Admin Paneli</h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Öğrenci ve danışman yönetimini buradan yapabilirsiniz.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Toplam Öğrenci" 
            value={totalStudents} 
            color="primary"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            trend={{ value: 12, label: "up" }}
            delay={0.1}
          />
          
          <StatCard 
            title="Danışman Atanmamış" 
            value={unassignedStudents} 
            color="warning"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend={{ value: 5, label: "down" }}
            delay={0.2}
          />
          
          <StatCard 
            title="Toplam Danışman" 
            value={totalAdvisors} 
            color="success"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            delay={0.3}
          />
          
          <StatCard 
            title="Danışman Başına Öğrenci" 
            value={averageStudentPerAdvisor} 
            color="accent"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            trend={{ value: 8, label: "up" }}
            delay={0.4}
          />
        </div>
        
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/30 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700/30">
            <nav className="flex -mb-px" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("students")}
                className={cn(
                  "py-4 px-6 text-sm font-medium border-b-2 focus:outline-none",
                  activeTab === "students"
                    ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                Öğrenciler
              </button>
              <button
                onClick={() => setActiveTab("advisors")}
                className={cn(
                  "py-4 px-6 text-sm font-medium border-b-2 focus:outline-none",
                  activeTab === "advisors"
                    ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                Danışmanlar
              </button>
            </nav>
          </div>
          
          {/* İçerik */}
          <div className="p-6">
            {/* Arama ve ekleme butonları */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full sm:w-64 text-gray-800 dark:text-gray-200"
                />
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                {activeTab === "students" ? (
                  <>
                    <button 
                      onClick={() => setIsStudentModalOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md rounded-full text-sm font-medium flex items-center w-full sm:w-auto justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Yeni Öğrenci
                    </button>
                    <button 
                      onClick={() => setIsAssignModalOpen(true)}
                      className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md rounded-full text-sm font-medium flex items-center w-full sm:w-auto justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Danışman Ata
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsAdvisorModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md rounded-full text-sm font-medium flex items-center w-full sm:w-auto justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Yeni Danışman
                  </button>
                )}
              </div>
            </div>
            
            {/* Tablo İçeriği */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary-200 dark:border-primary-800/40 opacity-40"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  {activeTab === "students" ? (
                    <>
                      <thead className="bg-gray-50 dark:bg-gray-700/30">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ad Soyad</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">E-posta</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefon</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Danışman</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800/50 backdrop-blur-sm divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                              <div className="flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>Öğrenci bulunamadı</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full blur-[1px]"></div>
                                    <div className="relative h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900 dark:to-accent-900 border-2 border-white dark:border-gray-800 font-medium text-gray-800 dark:text-gray-200">
                                      {student.name.charAt(0)}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {student.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {student.phone}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {student.advisor === "Atanmadı" ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/40 text-warning-800 dark:text-warning-300">
                                    Atanmadı
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/40 text-success-800 dark:text-success-300">
                                    {student.advisor}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium">
                                  Düzenle
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </>
                  ) : (
                    <>
                      <thead className="bg-gray-50 dark:bg-gray-700/30">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ad Soyad</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">E-posta</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefon</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Öğrenci Sayısı</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800/50 backdrop-blur-sm divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAdvisors.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                              <div className="flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>Danışman bulunamadı</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredAdvisors.map((advisor) => (
                            <tr key={advisor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-success-400 rounded-full blur-[1px]"></div>
                                    <div className="relative h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-accent-50 to-success-50 dark:from-accent-900 dark:to-success-900 border-2 border-white dark:border-gray-800 font-medium text-gray-800 dark:text-gray-200">
                                      {advisor.name.split(' ')[0].charAt(0)}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{advisor.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {advisor.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {advisor.phone}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div 
                                      className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" 
                                      style={{ width: `${Math.min(100, (advisor.studentCount / 15) * 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="ml-3 text-sm text-gray-900 dark:text-gray-100 font-medium">{advisor.studentCount}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium">
                                  Düzenle
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Toast */}
        {toast.open && (
          <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
            <div 
              className={cn(
                "rounded-lg shadow-lg p-4 text-white max-w-md",
                toast.type === "success" ? "bg-success-500 dark:bg-success-600" : 
                toast.type === "error" ? "bg-danger-500 dark:bg-danger-600" : 
                toast.type === "warning" ? "bg-warning-500 dark:bg-warning-600" : 
                "bg-primary-500 dark:bg-primary-600"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{toast.title}</h3>
                  <p className="text-sm opacity-90">{toast.message}</p>
                </div>
                <button 
                  onClick={() => setToast({ ...toast, open: false })}
                  className="text-white hover:opacity-70"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)}>
          <ModalHeader>Yeni Öğrenci Ekle</ModalHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentName">Ad Soyad</Label>
              <Input
                id="studentName"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="studentEmail">E-posta</Label>
              <Input
                id="studentEmail"
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="studentPhone">Telefon</Label>
              <Input
                id="studentPhone"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsStudentModalOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleAddStudent} 
              disabled={isSubmitting}
              className={isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <span className="mr-2">Ekleniyor</span>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                </div>
              ) : (
                "Ekle"
              )}
            </Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={isAdvisorModalOpen} onClose={() => setIsAdvisorModalOpen(false)}>
          <ModalHeader>Yeni Danışman Ekle</ModalHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="advisorName">Ad Soyad</Label>
              <Input
                id="advisorName"
                value={newAdvisor.name}
                onChange={(e) => setNewAdvisor({ ...newAdvisor, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="advisorEmail">E-posta</Label>
              <Input
                id="advisorEmail"
                type="email"
                value={newAdvisor.email}
                onChange={(e) => setNewAdvisor({ ...newAdvisor, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="advisorPhone">Telefon</Label>
              <Input
                id="advisorPhone"
                value={newAdvisor.phone}
                onChange={(e) => setNewAdvisor({ ...newAdvisor, phone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsAdvisorModalOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleAddAdvisor} 
              disabled={isSubmitting}
              className={isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <span className="mr-2">Ekleniyor</span>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                </div>
              ) : (
                "Ekle"
              )}
            </Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)}>
          <ModalHeader>Danışman Ata</ModalHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignStudent">Öğrenci</Label>
              <Select
                label="Öğrenci"
                value={selectedStudent}
                onChange={setSelectedStudent}
                options={studentOptions}
                placeholder="Öğrenci seçin"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="assignAdvisor">Danışman</Label>
              <Select
                label="Danışman"
                value={selectedAdvisor}
                onChange={setSelectedAdvisor}
                options={advisorOptions}
                placeholder="Danışman seçin"
                className="mt-1"
              />
            </div>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleAssignAdvisor}
              disabled={isSubmitting}
              className={isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <span className="mr-2">Atanıyor</span>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                </div>
              ) : (
                "Ata"
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </motion.div>
    </Layout>
  );
} 