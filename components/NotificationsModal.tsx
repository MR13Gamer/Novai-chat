import React from 'react';
import { FriendRequest } from '../types';
import { acceptFriendRequest } from '../services/chatService';
import { GlassCard } from './GlassCard';
import { X, Check, X as XIcon } from 'lucide-react';

interface NotificationsModalProps {
  requests: FriendRequest[];
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ requests, onClose }) => {
  
  const handleAccept = async (req: FriendRequest) => {
    try {
      await acceptFriendRequest(req);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <GlassCard className="w-full max-w-md p-6 relative h-[500px] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Notifications</h2>

        <div className="flex-1 overflow-y-auto space-y-3">
          {requests.length > 0 ? (
            requests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <img 
                    src={req.fromPhoto} 
                    className="w-10 h-10 rounded-full border border-white/10" 
                    alt={req.fromName}
                  />
                  <div>
                    <span className="text-white font-medium">{req.fromName}</span>
                    <p className="text-xs text-cyan-300">Sent a friend request</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req)}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    title="Accept"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  {/* Reject implementation can be added similarly */}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              No new notifications.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};