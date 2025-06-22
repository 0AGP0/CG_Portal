"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessagesContext';
import Link from 'next/link';

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

export default function MessagesPage() {
  const { user } = useAuth();
  const { 
    tickets, 
    unreadCount, 
    selectedTicketId, 
    selectTicket, 
    sendMessage, 
    createNewTicket,
    isLoading,
    isSending,
    error
  } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketContent, setNewTicketContent] = useState('');
  const [receiverType] = useState<'advisor'>('advisor');

  // Seçili mesajı getir
  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId);

  // Yeni mesaj gönderme
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTicketId || !selectedTicket) return;
    
    sendMessage(selectedTicket, newMessage);
    setNewMessage('');
  };

  // Yeni konu oluşturma işlemi
  const handleCreateNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTicketSubject.trim() || !newTicketContent.trim()) return;
    
    createNewTicket(newTicketSubject, newTicketContent);
    setNewTicketSubject('');
    setNewTicketContent('');
    setShowNewTicketForm(false);
  };

  // Erişim kontrolü
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
            <p className="mb-4">Bu sayfaya erişmek için giriş yapmalısınız.</p>
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
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#002757] dark:text-blue-300">
              Mesajlarım
            </h1>
            <p className="text-default mt-1">
              Danışmanınızla olan tüm mesajlaşmalarınızı buradan takip edebilirsiniz.
            </p>
          </div>
          
          {user.role === 'student' && (
            <button 
              onClick={() => setShowNewTicketForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <span>Yeni Konu Oluştur</span>
              <span className="text-lg">+</span>
            </button>
          )}
        </div>

        {/* İlk Yükleme Durumu */}
        {isLoading && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Mesajlar yükleniyor...</p>
            </div>
          </div>
        )}

        {/* Hata Mesajı */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          </motion.div>
        )}

        {/* Yeni Konu Oluşturma Formu */}
        {showNewTicketForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30"
          >
            <h2 className="text-xl font-semibold mb-4 text-[#002757] dark:text-blue-300">Yeni Konu Oluştur</h2>
            <form onSubmit={handleCreateNewTicket} className="space-y-4">
              {user.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alıcı</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="receiverType"
                        value="advisor"
                        checked={true}
                        readOnly
                        className="mr-2"
                      />
                      Danışman
                    </label>
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">Konu Başlığı</label>
                <input 
                  id="subject"
                  type="text"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="Konu başlığı girin"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">Mesajınız</label>
                <textarea 
                  id="content"
                  value={newTicketContent}
                  onChange={(e) => setNewTicketContent(e.target.value)}
                  rows={4}
                  placeholder="Mesajınızı yazın"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="px-4 py-2 bg-gray-200/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300/80 dark:hover:bg-gray-600/80 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Gönder
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Mesaj Listesi */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200/60 dark:border-gray-700/30">
              <h2 className="font-semibold text-[#002757] dark:text-blue-300">Konularım</h2>
            </div>
            
            <div className="divide-y divide-gray-200/60 dark:divide-gray-700/30">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <p>Mesajlar yükleniyor...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <p>Henüz mesajınız bulunmuyor.</p>
                  {user.role === 'student' && (
                    <button 
                      onClick={() => setShowNewTicketForm(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Yeni Konu Başlat
                    </button>
                  )}
                </div>
              ) : (
                tickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    variants={itemVariants}
                    onClick={() => selectTicket(ticket.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedTicketId === ticket.id 
                        ? 'bg-blue-50/70 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                        : ticket.isRead ? 'hover:bg-gray-50/70 dark:hover:bg-gray-700/30' : 'hover:bg-gray-50/70 dark:hover:bg-gray-700/30 bg-yellow-50/70 dark:bg-yellow-900/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-medium ${!ticket.isRead ? 'font-bold' : ''}`}>
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
            className="md:col-span-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100/60 dark:border-gray-700/30 flex flex-col h-[600px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {selectedTicket ? (
              <>
                <div className="p-4 border-b border-gray-200/60 dark:border-gray-700/30">
                  <h2 className="text-lg font-semibold text-[#002757] dark:text-blue-300 mb-1">{selectedTicket.subject}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedTicket.date}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="space-y-4">
                    {selectedTicket.messages.map((message, index) => (
                      <div 
                        key={index}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender === 'user' 
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
                    ))}
                    </div>
                </div>
                
                <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/30">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/90 dark:bg-gray-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1 ${
                        isSending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                      disabled={!newMessage.trim() || isSending}
                    >
                      {isSending ? (
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
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Lütfen görüntülemek için bir mesaj seçin</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">veya</p>
                  <button 
                    onClick={() => setShowNewTicketForm(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Yeni Bir Konu Başlat
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
} 