import React, { useState } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { GlassCard } from './GlassCard';
import { X, User as UserIcon, Mail, Save, LogOut } from 'lucide-react';
import { createOrUpdateUser } from '../services/chatService';

interface SettingsModalProps {
  currentUser: User;
  onClose: () => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ currentUser, onClose, onLogout }) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName === currentUser.displayName) return;

    setLoading(true);
    try {
      await updateProfile(currentUser, { displayName });
      // Sync with Firestore
      await createOrUpdateUser({ ...currentUser, displayName });
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6 relative animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-purple-200 mb-8 text-center">
          Account Settings
        </h2>

        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-purple-500">
              <img 
                src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${displayName}`} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover border-4 border-black/50"
              />
            </div>
          </div>
          <p className="mt-3 text-gray-400 text-sm">Profile Picture (from Google/Gravatar)</p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
            <div className="relative group">
              <UserIcon className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:bg-black/30 transition-all"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
              <input
                type="email"
                value={currentUser.email || ''}
                disabled
                className="w-full bg-white/5 border border-white/5 rounded-xl px-10 py-3 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button
              type="button"
              onClick={onLogout}
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <button
              type="submit"
              disabled={loading || displayName === currentUser.displayName}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-cyan-500/20 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};