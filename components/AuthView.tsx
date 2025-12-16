import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup 
} from "firebase/auth";
import { auth, googleProvider } from '../firebase';
import { GlassCard } from './GlassCard';
import { createOrUpdateUser, checkUsernameUnique } from '../services/chatService';
import { Sparkles, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

export const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove spaces immediately
    const val = e.target.value.replace(/\s/g, '');
    setUsername(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await createOrUpdateUser(cred.user);
      } else {
        if (!username) throw new Error("Username is required");
        
        // Unique username check
        const isUnique = await checkUsernameUnique(username);
        if (!isUnique) {
            throw new Error("Username is already taken. Please choose another.");
        }

        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (auth.currentUser) {
           await updateProfile(auth.currentUser, {
              displayName: username
           });
           await createOrUpdateUser({
             ...cred.user,
             displayName: username
           }, username);
        }
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createOrUpdateUser(result.user);
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <GlassCard className="w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-tr from-cyan-400 to-purple-500 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-purple-200">
              Glassy Chat
            </h1>
            <p className="text-gray-300 mt-2 text-sm">Connect with friends in style.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <UserIcon className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Username (No spaces)"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:bg-black/30 transition-all"
                  value={username}
                  onChange={handleUsernameChange}
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:bg-black/30 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:bg-black/30 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-cyan-500/20 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && !error ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-900 font-medium py-3 rounded-xl shadow-lg hover:bg-gray-50 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="ml-2 text-cyan-300 hover:text-cyan-200 font-medium hover:underline transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};