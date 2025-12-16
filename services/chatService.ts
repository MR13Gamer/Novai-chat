import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  where,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from '../firebase';
import { Message, UserProfile, FriendRequest } from '../types';

// --- UTILS ---
export const getConversationId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};

// --- MESSAGES ---
export const sendMessage = async (currentUid: string, receiverUid: string, text: string) => {
  if (!text.trim()) return;
  const conversationId = getConversationId(currentUid, receiverUid);
  const messagesRef = collection(db, 'messages');
  await addDoc(messagesRef, {
    text,
    senderId: currentUid,
    receiverId: receiverUid,
    conversationId,
    timestamp: serverTimestamp(),
    seen: false
  });
};

export const subscribeToMessages = (currentUid: string, receiverUid: string, callback: (messages: Message[]) => void) => {
  const conversationId = getConversationId(currentUid, receiverUid);
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, where('conversationId', '==', conversationId));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Message))
      .sort((a, b) => (a.timestamp?.toMillis?.() || Date.now()) - (b.timestamp?.toMillis?.() || Date.now()));
    callback(messages);
  });
};

// --- USERS & AUTH ---
export const checkUsernameUnique = async (username: string): Promise<boolean> => {
  const normalized = username.toLowerCase().trim();
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', normalized));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const createOrUpdateUser = async (user: any, customDisplayName?: string) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    
    // Only update if new or if essential fields are missing
    if (!snapshot.exists()) {
       const displayName = customDisplayName || user.displayName || user.email?.split('@')[0] || 'User';
       const username = displayName.toLowerCase().trim().replace(/\s/g, ''); // Ensure no spaces
       
       await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName,
        username,
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${displayName}`,
        isOnline: true,
        lastSeen: serverTimestamp()
      }, { merge: true });
    } else {
      await updateDoc(userRef, { 
        isOnline: true, 
        lastSeen: serverTimestamp() 
      });
    }
  } catch (error) {
    console.warn("User update error:", error);
  }
};

export const searchUsers = async (searchTerm: string, currentUid: string): Promise<UserProfile[]> => {
  if (!searchTerm.trim()) return [];
  const normalized = searchTerm.toLowerCase().trim();
  const usersRef = collection(db, 'users');
  
  // Search by username prefix
  const q = query(
    usersRef, 
    where('username', '>=', normalized),
    where('username', '<=', normalized + '\uf8ff')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => doc.data() as UserProfile)
    .filter(u => u.uid !== currentUid);
};

// --- FRIENDS SYSTEM ---

// 1. Send Request
export const sendFriendRequest = async (currentUser: UserProfile, targetUid: string) => {
  const requestsRef = collection(db, 'friend_requests');
  
  // Check if request already exists (either pending or accepted)
  // Note: Detailed security rules should also prevent this, but UI check is faster
  const q = query(
    requestsRef, 
    where('fromUid', '==', currentUser.uid),
    where('toUid', '==', targetUid)
  );
  
  const existing = await getDocs(q);
  const hasPendingOrAccepted = existing.docs.some(d => d.data().status !== 'rejected');
  
  if (hasPendingOrAccepted) return; 

  await addDoc(requestsRef, {
    fromUid: currentUser.uid,
    fromName: currentUser.displayName,
    fromPhoto: currentUser.photoURL,
    toUid: targetUid,
    status: 'pending',
    timestamp: serverTimestamp()
  });
};

// 2. Listen to Incoming Requests
export const subscribeToFriendRequests = (currentUid: string, callback: (reqs: FriendRequest[]) => void) => {
  const requestsRef = collection(db, 'friend_requests');
  const q = query(
    requestsRef, 
    where('toUid', '==', currentUid),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
    callback(reqs);
  });
};

// 2b. Listen to SENT Requests (to show "Pending" status in UI)
export const subscribeToSentRequests = (currentUid: string, callback: (reqs: FriendRequest[]) => void) => {
  const requestsRef = collection(db, 'friend_requests');
  const q = query(
    requestsRef, 
    where('fromUid', '==', currentUid),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
    callback(reqs);
  });
};

// 3. Accept Request
export const acceptFriendRequest = async (request: FriendRequest) => {
  const batch = db.batch(); 

  // A. Update request status
  const requestRef = doc(db, 'friend_requests', request.id);
  await updateDoc(requestRef, { status: 'accepted' });

  // B. Add to My Friends
  const myFriendRef = doc(db, 'users', request.toUid, 'friends', request.fromUid);
  await setDoc(myFriendRef, { since: serverTimestamp() });

  // C. Add to Their Friends
  const theirFriendRef = doc(db, 'users', request.fromUid, 'friends', request.toUid);
  await setDoc(theirFriendRef, { since: serverTimestamp() });
};

// 4. Subscribe to Friends List
export const subscribeToFriends = (currentUid: string, callback: (friends: UserProfile[]) => void) => {
  const friendsRef = collection(db, 'users', currentUid, 'friends');
  
  return onSnapshot(friendsRef, async (snapshot) => {
    const friendIds = snapshot.docs.map(doc => doc.id);
    if (friendIds.length === 0) {
      callback([]);
      return;
    }

    const promises = friendIds.map(uid => getDoc(doc(db, 'users', uid)));
    const userDocs = await Promise.all(promises);
    const friends = userDocs
      .filter(doc => doc.exists())
      .map(doc => doc.data() as UserProfile);
      
    callback(friends);
  });
};