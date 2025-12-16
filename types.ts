import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username?: string; // lowercase for search/uniqueness
  photoURL?: string;
  isOnline?: boolean;
  createdAt?: Timestamp;
}

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  receiverId: string;
  conversationId?: string;
  timestamp: Timestamp;
  seen: boolean;
}

export interface ChatSession {
  friend: UserProfile;
  lastMessage?: string;
  lastMessageTime?: Timestamp;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  fromName: string;
  fromPhoto: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Timestamp;
}