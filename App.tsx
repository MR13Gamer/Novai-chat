import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { AuthView } from './components/AuthView';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { SettingsModal } from './components/SettingsModal';
import { AddFriendModal } from './components/AddFriendModal';
import { NotificationsModal } from './components/NotificationsModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { subscribeToFriends, subscribeToFriendRequests, subscribeToSentRequests } from './services/chatService';
import { UserProfile, FriendRequest } from './types';
import { Settings } from 'lucide-react';

const BackgroundContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-screen w-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-slate-900 text-white font-sans selection:bg-cyan-500/30">
      <div className="fixed top-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
      {children}
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  
  // UI State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Handle Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch data when logged in
  useEffect(() => {
    if (currentUser) {
      const unsubFriends = subscribeToFriends(currentUser.uid, setFriends);
      const unsubIncoming = subscribeToFriendRequests(currentUser.uid, setIncomingRequests);
      const unsubSent = subscribeToSentRequests(currentUser.uid, setSentRequests);

      return () => {
        unsubFriends();
        unsubIncoming();
        unsubSent();
      };
    } else {
      setFriends([]);
      setIncomingRequests([]);
      setSentRequests([]);
      setSelectedUser(null);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsSettingsOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <BackgroundContainer>
        <AuthView />
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer>
      {isSettingsOpen && (
        <SettingsModal 
          currentUser={currentUser} 
          onClose={() => setIsSettingsOpen(false)} 
          onLogout={handleLogout}
        />
      )}

      {isAddFriendOpen && (
        <AddFriendModal
          currentUser={currentUser}
          friends={friends}
          sentRequests={sentRequests}
          onClose={() => setIsAddFriendOpen(false)}
        />
      )}

      {isNotificationsOpen && (
        <NotificationsModal
          requests={incomingRequests}
          onClose={() => setIsNotificationsOpen(false)}
        />
      )}
      
      <div className="h-full w-full max-w-[1600px] mx-auto flex md:p-6 lg:p-8 relative z-0">
        <div className="w-full h-full md:rounded-3xl overflow-hidden shadow-2xl flex bg-black/40 backdrop-blur-2xl border border-white/10">
          
          {/* Sidebar (Chat List) */}
          <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-white/10`}>
             <div 
                className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors group"
                onClick={() => setIsSettingsOpen(true)}
             >
                <div className="flex items-center gap-3">
                   <div className="relative">
                     <img 
                        src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}`} 
                        className="w-10 h-10 rounded-full border border-cyan-500/50 group-hover:border-cyan-400 transition-colors"
                        alt="Profile"
                     />
                     <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
                       <Settings className="w-3 h-3 text-gray-400" />
                     </div>
                   </div>
                   <div className="flex flex-col">
                      <span className="font-semibold text-sm group-hover:text-cyan-200 transition-colors">{currentUser.displayName || 'Me'}</span>
                      <span className="text-xs text-green-400">Online</span>
                   </div>
                </div>
             </div>

             <ChatList 
                users={friends} 
                selectedUser={selectedUser} 
                onSelectUser={setSelectedUser}
                currentUserUid={currentUser.uid}
                onOpenAddFriend={() => setIsAddFriendOpen(true)}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                notificationCount={incomingRequests.length}
             />
          </div>

          {/* Main Chat Area */}
          <div className={`${!selectedUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-black/20`}>
            {selectedUser ? (
              <ChatWindow 
                currentUser={currentUser} 
                selectedUser={selectedUser} 
                onBack={() => setSelectedUser(null)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/40 to-purple-500/40 rounded-full backdrop-blur-md" />
                </div>
                <h2 className="text-2xl font-light tracking-wide mb-2">Welcome to Glassy Chat</h2>
                <p className="text-gray-400 max-w-sm">Select a friend or add someone new to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BackgroundContainer>
  );
};

export default App;