"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessagesContext';

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
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

// Öğrenci tipi
interface Student {
  id: string;
  email: string;
  name: string;
  lastActive?: string;
}

export default function AdvisorMessagesPage() {
  const { user, isAdvisor } = useAuth();
  const { 
    tickets, 
    unreadCount, 
    selectedTicketId, 
    selectTicket, 
    sendMessage,
    refreshMessages,
    isSending,
    isLoading: isMessagesLoading,
    error: messagesError
  } = useMessages();
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketContent, setNewTicketContent] = useState('');
  const [localTickets, setLocalTickets] = useState(tickets);
  const [isLocalSending, setIsLocalSending] = useState(false);

  // Danışmanın öğrencilerini getir
  useEffect(() => {
    if (user && isAdvisor()) {
      fetchStudents();
    }
  }, [user]);
  
  // Öğrencileri getir
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/advisor/students', {
        headers: {
          'x-user-email': user?.email || ''
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Öğrenci listesi alınamadı');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.students)) {
        const mappedStudents = data.students.map((student: any) => ({
          id: student.email,
          email: student.email,
          name: student.name || student.email.split('@')[0],
          lastActive: student.updatedAt
        }));
        
        setStudents(mappedStudents);
      } else {
        throw new Error('Öğrenci verileri beklenmeyen formatta');
      }
    } catch (error) {
      console.error('Öğrenci verilerini getirme hatası:', error);
      setError(error instanceof Error ? error.message : 'Öğrenci listesi alınamadı');
    } finally {
      setIsLoading(false);
    }
  };

  // Tickets değiştiğinde localTickets'i güncelle
  useEffect(() => {
    setLocalTickets(tickets);
  }, [tickets]);

  // Bir öğrencinin seçilmesiyle ilgili mesajları filtreleyelim
  const studentTickets = selectedStudentId 
    ? localTickets.filter(ticket => ticket.studentEmail === selectedStudentId || ticket.studentId === selectedStudentId)
    : [];

  // Seçilen mesaj
  const selectedTicket = localTickets.find(ticket => ticket.id === selectedTicketId);
  
  // Seçili öğrenci
  const selectedStudent = students.find(student => student.id === selectedStudentId);

  // Öğrenci arama
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Öğrenci seçimi
  const selectStudent = (id: string) => {
    setSelectedStudentId(id);
    selectTicket(0); // Öğrenci değiştiğinde mesaj seçimini sıfırla
  };

  // Yeni konu oluşturma modalını aç
  const openNewTicketModal = () => {
    if (!selectedStudentId || !selectedStudent) return;
    setNewTicketSubject('');
    setNewTicketContent('');
    setShowNewTicketModal(true);
  };

  // Yeni konu oluşturma
  const handleCreateNewTicket = async () => {
    if (!selectedStudentId || !selectedStudent || !newTicketSubject.trim() || !newTicketContent.trim()) return;
    
    try {
      setError(null);
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          receiverEmail: selectedStudentId,
          content: newTicketContent,
          senderRole: 'advisor',
          subject: newTicketSubject
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Yeni mesaj oluşturulamadı');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Yeni mesaj oluşturulamadı');
      }
      
      // Modal'ı kapat
      setShowNewTicketModal(false);
      setNewTicketSubject('');
      setNewTicketContent('');
      
      // Mesajları yeniden yükle (yeni konu oluşturulduğu için)
      setTimeout(() => {
        refreshMessages();
      }, 100);
      
    } catch (error) {
      console.error('Yeni mesaj oluşturma hatası:', error);
      setError(error instanceof Error ? error.message : 'Yeni mesaj oluşturulurken bir hata oluştu');
    }
  };

  // Mesaj gönderme
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTicketId || !selectedTicket) return;
    
    const messageContent = newMessage.trim();
    setNewMessage(''); // Mesajı hemen temizle
    setIsLocalSending(true); // Gönderiliyor durumunu başlat
    
    try {
      setError(null);
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          receiverEmail: selectedStudentId,
          content: messageContent,
          senderRole: 'advisor',
          subject: selectedTicket.subject
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Mesaj gönderilemedi');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Mesaj gönderilemedi');
      }
      
      // Mesajı doğrudan localTickets state'ine ekle
      const newMessageObj = {
        sender: 'advisor' as const,
        content: messageContent,
        timestamp: new Date().toISOString()
      };
      
      setLocalTickets(prevTickets => 
        prevTickets.map(ticket => {
          if (ticket.id === selectedTicketId) {
            return {
              ...ticket,
              messages: [...ticket.messages, newMessageObj],
              preview: messageContent,
              date: new Date().toISOString()
            };
          }
          return ticket;
        })
      );
      
      // Otomatik scroll için kısa bir gecikme
      setTimeout(() => {
        const messageContainer = document.querySelector('.message-container');
        if (messageContainer) {
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      }, 100);
      
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      setError(error instanceof Error ? error.message : 'Mesaj gönderilirken bir hata oluştu');
      // Hata durumunda mesajı geri ekle
      setNewMessage(messageContent);
    } finally {
      setIsLocalSending(false); // Gönderiliyor durumunu bitir
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

  // Yükleniyor durumu
  if (isLoading || isMessagesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  // Hata durumu
  if (error || messagesError) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Hata Oluştu</h1>
            <p className="mb-4">{error || messagesError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Sayfayı Yenile
            </button>
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#002757] dark:text-blue-300">
            Mesajlaşma Paneli
          </h1>
          <p className="text-default mt-1">
            Öğrencilerinizle olan tüm mesajlaşmalarınızı buradan takip edebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Öğrenci Listesi */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200/60 dark:border-gray-700/30">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Öğrenci ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="font-semibold text-[#002757] dark:text-blue-300">Öğrencilerim</h2>
            </div>
            
            <div className="divide-y divide-gray-200/60 dark:divide-gray-700/30 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <p>Öğrenciler yükleniyor...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <p>Sonuç bulunamadı</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <motion.div
                    key={student.id}
                    variants={itemVariants}
                    onClick={() => selectStudent(student.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedStudentId === student.id 
                        ? 'bg-blue-50/70 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50/70 dark:hover:bg-gray-700/30 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{student.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
          
          {/* Mesaj Konuları */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200/60 dark:border-gray-700/30 flex justify-between items-center">
              <h2 className="font-semibold text-[#002757] dark:text-blue-300">Konular</h2>
              
              {selectedStudentId && (
                <button 
                  onClick={openNewTicketModal}
                  className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  title="Yeni Konu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="divide-y divide-gray-200/60 dark:divide-gray-700/30 max-h-[600px] overflow-y-auto">
              {!selectedStudentId ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <p>Lütfen bir öğrenci seçin</p>
                </div>
              ) : studentTickets.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <p className="mb-2">Mesaj bulunamadı</p>
                  <button 
                    onClick={openNewTicketModal}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Yeni Mesaj Oluştur
                  </button>
                </div>
              ) : (
                studentTickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    variants={itemVariants}
                    onClick={() => selectTicket(ticket.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedTicketId === ticket.id 
                        ? 'bg-blue-50/70 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                        : ticket.isRead ? 'hover:bg-gray-50/70 dark:hover:bg-gray-700/30' : 'hover:bg-gray-50/70 bg-yellow-50/70 dark:hover:bg-gray-700/30 dark:bg-yellow-900/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-medium text-gray-900 dark:text-gray-100 ${!ticket.isRead ? 'font-bold' : ''}`}>
                        {ticket.subject}
                      </h3>
                      {!ticket.isRead && (
                        <span className="bg-blue-500 rounded-full w-2 h-2"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{ticket.preview}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ticket.date}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
          
          {/* Mesaj İçeriği */}
          <motion.div 
            className="md:col-span-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 flex flex-col h-[600px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {!selectedStudentId ? (
              <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                  <div className="text-5xl mb-4">👤</div>
                  <h3 className="text-xl font-semibold mb-2 text-[#002757] dark:text-blue-300">Öğrenci Seçin</h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md">
                    Mesajlaşmak için soldaki listeden bir öğrenci seçin.
                  </p>
                </div>
              </div>
            ) : !selectedTicketId ? (
              <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2 text-[#002757] dark:text-blue-300">Mesaj Seçin</h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md">
                    {selectedStudent?.name} ile olan mesajlarınızı görüntülemek için bir konu seçin veya yeni bir konu başlatın.
                  </p>
                  {studentTickets.length === 0 && (
                    <button 
                      onClick={openNewTicketModal}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Yeni Mesaj Oluştur
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-200/60 dark:border-gray-700/30">
                  <h2 className="font-semibold text-lg text-[#002757] dark:text-blue-300">
                    {selectedTicket?.subject} 
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                      ({selectedStudent?.name})
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTicket?.date}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-800/50 message-container" style={{ maxHeight: '450px' }}>
                  {selectedTicket?.messages && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((message, index) => (
                      <div 
                        key={index}
                        className={`flex ${message.sender === 'advisor' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender === 'advisor' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 text-right mt-1">
                            {message.timestamp || ""}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 my-8">
                      <p>Bu konuda henüz mesaj bulunmuyor. Bir mesaj göndererek konuşmayı başlatın.</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/30">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLocalSending}
                    />
                    <button
                      type="submit"
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md transition-colors flex items-center gap-1 ${
                        isLocalSending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                      disabled={!newMessage.trim() || isLocalSending}
                    >
                      {isLocalSending ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Gönderiliyor...</span>
                        </>
                      ) : (
                        <>
                          <span>Gönder</span>
                          <span className="text-lg">→</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Yeni Konu Oluşturma Modal */}
        {showNewTicketModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4 text-[#002757] dark:text-blue-300">
                Yeni Konu Oluştur
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Konu Başlığı
                  </label>
                  <input
                    type="text"
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                    placeholder="Konu başlığını girin..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mesaj İçeriği
                  </label>
                  <textarea
                    value={newTicketContent}
                    onChange={(e) => setNewTicketContent(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    rows={4}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewTicketModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateNewTicket}
                  disabled={!newTicketSubject.trim() || !newTicketContent.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Oluştur
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
} 