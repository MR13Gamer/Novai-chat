import React, { useState } from 'react';
import { UserProfile, FriendRequest } from '../types';
import { Search, UserPlus, Bell } from 'lucide-react';

interface ChatListProps {
  users: UserProfile[]; // These are FRIENDS
  selectedUser: UserProfile | null;
  onSelectUser: (user: UserProfile) => void;
  currentUserUid: string;
  onOpenAddFriend: () => void;
  onOpenNotifications: () => void;
  notificationCount: number;
}

export const ChatList: React.FC<ChatListProps> = ({ 
  users, 
  selectedUser, 
  onSelectUser,
  onOpenAddFriend,
  onOpenNotifications,
  notificationCount
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter existing friends locally
  const filteredFriends = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-md border-r border-white/10">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-purple-200">
            Friends
            </h2>
            <div className="flex gap-2">
                <button 
                    onClick={onOpenNotifications}
                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 hover:text-cyan-400 transition-colors relative"
                >
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-black"></span>
                    )}
                </button>
                <button 
                    onClick={onOpenAddFriend}
                    className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full hover:bg-cyan-500/30 text-cyan-200 transition-colors"
                    title="Add Friend"
                >
                    <UserPlus className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search my friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredFriends.map((user) => (
          <div
            key={user.uid}
            onClick={() => onSelectUser(user)}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors ${
              selectedUser?.uid === user.uid ? 'bg-white/10 border-r-2 border-cyan-400' : ''
            }`}
          >
            <div className="relative">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                alt={user.displayName}
                className="w-12 h-12 rounded-full object-cover border border-white/20"
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                user.isOnline ? 'bg-green-500' : 'bg-gray-500'
              }`}></span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate">{user.displayName}</h3>
              <p className="text-xs text-gray-400 truncate">
                Click to start chatting
              </p>
            </div>
          </div>
        ))}
        
        {filteredFriends.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500 h-64">
                <p className="mb-4">
                    {searchTerm ? 'No friends found.' : 'You have no friends yet.'}
                </p>
                {!searchTerm && (
                    <button 
                        onClick={onOpenAddFriend}
                        className="text-cyan-400 text-sm hover:underline"
                    >
                        Find people to add
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};