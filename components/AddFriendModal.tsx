import React, { useState, useEffect } from 'react';
import { UserProfile, FriendRequest } from '../types';
import { searchUsers, sendFriendRequest } from '../services/chatService';
import { GlassCard } from './GlassCard';
import { X, Search, UserPlus, Check, UserCheck, Clock } from 'lucide-react';

interface AddFriendModalProps {
  currentUser: any;
  friends: UserProfile[];
  sentRequests: FriendRequest[];
  onClose: () => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({ currentUser, friends, sentRequests, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Live search debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        setLoading(true);
        try {
          const users = await searchUsers(searchTerm, currentUser.uid);
          setResults(users);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 400); // 400ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentUser.uid]);

  const handleAdd = async (targetUid: string) => {
    try {
      await sendFriendRequest(currentUser, targetUid);
      // We don't need local state for sent, as the parent component passes `sentRequests` 
      // which will update automatically via Firestore subscription
    } catch (err) {
      console.error(err);
    }
  };

  const getStatus = (uid: string) => {
    if (friends.some(f => f.uid === uid)) return 'friend';
    if (sentRequests.some(r => r.toUid === uid)) return 'pending';
    return 'none';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <GlassCard className="w-full max-w-md p-6 relative h-[500px] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Find People</h2>

        <div className="mb-6 relative">
            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Start typing username..."
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
              autoFocus
            />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="text-center text-gray-500 py-4 flex flex-col items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mb-2"></div>
                Searching...
            </div>
          ) : results.length > 0 ? (
            results.map(user => {
              const status = getStatus(user.uid);
              
              return (
                <div key={user.uid} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.photoURL} 
                      className="w-10 h-10 rounded-full border border-white/10" 
                      alt={user.displayName}
                    />
                    <div>
                      <h4 className="text-white font-medium">{user.displayName}</h4>
                      <p className="text-xs text-gray-500">@{user.username || user.displayName}</p>
                    </div>
                  </div>
                  
                  {status === 'friend' ? (
                     <div className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-medium flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Friend
                     </div>
                  ) : status === 'pending' ? (
                     <div className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Sent
                     </div>
                  ) : (
                    <button
                      onClick={() => handleAdd(user.uid)}
                      className="p-2 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 rounded-lg transition-all"
                      title="Add Friend"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-10">
              {searchTerm ? 'No users found.' : 'Search for friends by username.'}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};