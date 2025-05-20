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
    createNewTicket 
  } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketContent, setNewTicketContent] = useState('');
  const [receiverType, setReceiverType] = useState<'advisor' | 'sales'>('advisor');

  // Seçili mesajı getir
  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId);

  // Yeni mesaj gönderme
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTicketId) return;
    
    sendMessage(newMessage);
    setNewMessage('');
  };

  // Yeni konu oluşturma işlemi
  const handleCreateNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTicketSubject.trim() || !newTicketContent.trim()) return;
    
    createNewTicket(newTicketSubject, newTicketContent, receiverType);
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
            <h1 className="text-3xl font-bold text-[#002757]">
              Mesajlarım
            </h1>
            <p className="text-default mt-1">
              Danışmanınızla ve satış ekibiyle olan tüm mesajlaşmalarınızı buradan takip edebilirsiniz.
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

        {/* Yeni Konu Oluşturma Formu */}
        {showNewTicketForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4 text-[#002757]">Yeni Konu Oluştur</h2>
            <form onSubmit={handleCreateNewTicket} className="space-y-4">
              {user.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Alıcı</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="receiverType"
                        value="advisor"
                        checked={receiverType === 'advisor'}
                        onChange={() => setReceiverType('advisor')}
                        className="mr-2"
                      />
                      Danışman
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="receiverType"
                        value="sales"
                        checked={receiverType === 'sales'}
                        onChange={() => setReceiverType('sales')}
                        className="mr-2"
                      />
                      Satış Ekibi
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
            className="md:col-span-1 bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-[#002757]">Konularım</h2>
            </div>
            
            <div className="divide-y">
              {tickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  variants={itemVariants}
                  onClick={() => selectTicket(ticket.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTicketId === ticket.id 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : ticket.isRead ? 'hover:bg-gray-50' : 'hover:bg-gray-50 bg-yellow-50'
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
                  <p className="text-sm text-gray-600 truncate">{ticket.preview}</p>
                  <p className="text-xs text-gray-500 mt-1">{ticket.date}</p>
                </motion.div>
              ))}
              
              {tickets.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <p>Henüz mesajınız bulunmuyor.</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Mesaj İçeriği */}
          <motion.div 
            className="md:col-span-3 bg-white rounded-lg shadow-md flex flex-col h-[600px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {selectedTicket ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-lg text-[#002757]">{selectedTicket.subject}</h2>
                  <p className="text-sm text-gray-500">{selectedTicket.date}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '450px' }}>
                  {selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((message, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg max-w-[80%] ${
                          message.sender === 'user' 
                            ? 'bg-blue-100 ml-auto' 
                            : message.sender === 'advisor'
                              ? 'bg-gray-100'
                              : 'bg-orange-100'
                        }`}
                      >
                        <p className="text-sm mb-1">{message.content}</p>
                        <p className="text-xs text-gray-500">
                          {message.sender === 'user' ? 'Siz' : 
                           message.sender === 'advisor' ? 'Danışman' : 'Satış Temsilcisi'} - {message.timestamp}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 my-8">
                      <p>Yeni bir mesaj göndererek konuşmayı başlatın.</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Gönder
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2 text-[#002757]">Mesajlarınız</h3>
                  <p className="text-gray-600 max-w-md">
                    Soldaki listeden bir konuşma seçin veya yeni bir konu başlatın.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
} 