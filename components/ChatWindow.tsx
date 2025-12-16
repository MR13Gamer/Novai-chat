import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message } from '../types';
import { subscribeToMessages, sendMessage } from '../services/chatService';
import { Send, Phone, Video, MoreVertical, ArrowLeft, Paperclip } from 'lucide-react';

interface ChatWindowProps {
  currentUser: any;
  selectedUser: UserProfile;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, selectedUser, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(currentUser.uid, selectedUser.uid, setMessages);
    return () => unsubscribe();
  }, [currentUser.uid, selectedUser.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const text = inputText;
    setInputText('');
    await sendMessage(currentUser.uid, selectedUser.uid, text);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '...';
    // Handle Firestore timestamp or Date object
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl z-10 shadow-lg shadow-black/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="md:hidden p-2 -ml-2 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative group cursor-pointer">
            <img
              src={selectedUser.photoURL || `https://ui-avatars.com/api/?name=${selectedUser.displayName}`}
              alt={selectedUser.displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500/30 group-hover:border-cyan-400 transition-colors"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 bg-green-500"></span>
          </div>
          
          <div>
            <h3 className="font-semibold text-white tracking-wide">{selectedUser.displayName}</h3>
            <span className="text-xs text-green-400 flex items-center gap-1 font-medium">
              Online
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          <button className="p-2 hover:text-cyan-400 hover:bg-white/10 rounded-full transition-all"><Phone className="w-5 h-5" /></button>
          <button className="p-2 hover:text-cyan-400 hover:bg-white/10 rounded-full transition-all"><Video className="w-5 h-5" /></button>
          <button className="p-2 hover:text-cyan-400 hover:bg-white/10 rounded-full transition-all"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="text-center text-xs text-gray-500 my-4 uppercase tracking-widest font-semibold opacity-60">Today</div>
        
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser.uid;
          
          return (
            <div
              key={msg.id || idx}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              {!isMe && (
                 <img 
                   src={selectedUser.photoURL || `https://ui-avatars.com/api/?name=${selectedUser.displayName}`}
                   className="w-8 h-8 rounded-full self-end mr-2 mb-1 border border-white/10 opacity-75"
                   alt=""
                 />
              )}
              
              <div
                className={`max-w-[75%] md:max-w-[60%] px-5 py-3 rounded-2xl relative shadow-md ${
                  isMe
                    ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-sm shadow-cyan-500/10'
                    : 'bg-white/10 text-gray-100 rounded-tl-sm border border-white/5 shadow-black/20'
                }`}
              >
                <p className="text-[15px] leading-relaxed font-light">{msg.text}</p>
                <div className={`text-[10px] mt-1.5 opacity-70 flex items-center gap-1 select-none ${isMe ? 'justify-end text-cyan-50' : 'text-gray-400'}`}>
                    {formatTime(msg.timestamp)}
                    {isMe && (
                        <span>
                           {msg.seen ? (
                               <span className="text-cyan-200 ml-1">✓✓</span>
                           ) : (
                               <span className="ml-1">✓</span>
                           )}
                        </span>
                    )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-5 border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <form onSubmit={handleSend} className="flex gap-3 relative max-w-4xl mx-auto">
          <button 
            type="button" 
            className="p-3 text-gray-400 hover:text-cyan-400 hover:bg-white/5 rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all shadow-inner"
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
};