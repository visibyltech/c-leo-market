import React, { useState } from 'react';
import { LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';
import { useShop } from '../context/ShopContext';

type AuthMode = 'login' | 'signup' | 'reset';

export const AuthPanel: React.FC<{ onComplete?: () => void; compact?: boolean }> = ({ onComplete, compact = false }) => {
  const { signIn, signUp, showToast } = useShop();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'reset') {
        await sendPasswordResetEmail(firebaseAuth, email.trim());
        setNotice('Password reset link sent. Check your email inbox and spam folder.');
        return;
      }
      if (mode === 'signup') await signUp(email, password, name);
      else await signIn(email, password);
      showToast(mode === 'signup' ? 'Account created. Check your email to verify it before placing an order.' : 'Welcome back.');
      onComplete?.();
    } catch (err: any) {
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'An account already exists with this email. Please sign in or reset its password.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/weak-password': 'Use a password with at least 6 characters.',
        'auth/invalid-credential': 'Email or password is incorrect. Try resetting your password.',
        'auth/user-not-found': 'No account was found with this email.',
        'auth/network-request-failed': 'Network error. Check your connection and try again.',
      };
      setError(messages[err?.code] || err?.message || 'Unable to complete this request. Please try again.');
    } finally { setBusy(false); }
  };

  const title = mode === 'signup' ? 'Create your C-LEO account' : mode === 'reset' ? 'Reset your password' : 'Welcome back';
  const description = mode === 'signup' ? 'Sign up to continue with checkout and track your orders.' : mode === 'reset' ? 'Enter your account email and we will send you a password reset link.' : 'Sign in to access your orders and continue checkout.';

  return <div className={`w-full ${compact ? '' : 'max-w-md mx-auto'} bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4`}>
    <div className="text-center space-y-2">
      <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-[#0B4FD8] flex items-center justify-center"><LockKeyhole className="w-6 h-6" /></div>
      <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
    <form onSubmit={submit} className="space-y-3">
      {mode === 'signup' && <label className="block text-xs font-semibold text-slate-700">Full name<input required value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" autoComplete="name" /></label>}
      <label className="block text-xs font-semibold text-slate-700">Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" autoComplete="email" /></label>
      {mode !== 'reset' && <label className="block text-xs font-semibold text-slate-700">Password
        <span className="relative mt-1 block">
          <input required minLength={6} type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-12" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-slate-500 hover:text-[#0B4FD8]">
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </span>
      </label>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {notice && <p className="text-xs text-emerald-700">{notice}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-[#0B4FD8] py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? 'Please wait…' : mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Send Reset Link' : 'Sign In'}</button>
    </form>
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-slate-600">
      {mode === 'login' && <button type="button" onClick={()=>{setMode('reset');setError('');setNotice('');}} className="font-bold text-[#0B4FD8]">Forgot password?</button>}
      {mode === 'reset' ? <button type="button" onClick={()=>{setMode('login');setError('');setNotice('');}} className="font-bold text-[#0B4FD8]">Back to sign in</button> :
        <span>{mode === 'signup' ? 'Already have an account?' : 'New to C-LEO Market?'} <button type="button" onClick={()=>{setMode(mode === 'signup' ? 'login' : 'signup');setError('');setNotice('');}} className="font-bold text-[#0B4FD8]">{mode === 'signup' ? 'Sign in' : 'Create account'}</button></span>}
    </div>
  </div>;
};
