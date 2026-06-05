'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { loginUser } from '@/app/actions/auth';
import { isSupabaseConfigured, supabase } from '@/utils/supabase';

// Mock Google accounts for the sign-in simulation
const mockGoogleAccounts = [
  {
    id: 'user-demo-123', // Preserves existing user space & default dashboard state
    name: 'Demo User',
    email: 'demo@daddykart.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    tier: 'Free' as const,
  },
  {
    id: 'user-alex-456',
    name: 'Alex Developer',
    email: 'alex.dev@daddykart.com',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    tier: 'Pro' as const,
  },
  {
    id: 'user-sarah-789',
    name: 'Sarah Designer',
    email: 'sarah.design@daddykart.com',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    tier: 'Free' as const,
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  
  // Custom login state
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  // Authenticate triggers
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });
        if (error) throw error;
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to authenticate with Google OAuth.');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      setShowSimulator(true);
    }
  };

  const handleSelectMockAccount = async (account: typeof mockGoogleAccounts[0]) => {
    setIsLoading(true);
    setShowSimulator(false);
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      await loginUser(account);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMsg('Failed to create user session.');
      setIsLoading(false);
    }
  };

  const handleCustomAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) return;

    setIsLoading(true);
    setShowSimulator(false);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const customAccount = {
      id: `user-${Date.now()}`,
      name: customName,
      email: customEmail,
      avatar_url: `https://images.unsplash.com/photo-${1535713800000 + Math.floor(Math.random() * 100000)}?w=150&q=80`,
      tier: 'Free' as const,
    };

    try {
      await loginUser(customAccount);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMsg('Failed to create custom user session.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] min-h-screen relative overflow-hidden font-sans selection:bg-[#a3e635] selection:text-black flex items-center justify-center p-4">
      
      {/* Import the fonts explicitly to match the Stitch design system exactly */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Hanken+Grotesk:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" 
        rel="stylesheet" 
      />

      {/* Style overrides for circuit and animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .font-serif-stitch {
          font-family: 'Libre Caslon Text', serif;
        }
        .font-sans-stitch {
          font-family: 'Hanken Grotesk', sans-serif;
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.15; transform: scale(1.05); }
          50% { opacity: 0.35; transform: scale(1); }
        }
        .circuit-bg-animate {
          animation: subtlePulse 8s ease-in-out infinite;
        }
        .hero-glow {
          background: radial-gradient(circle at 50% 50%, rgba(163, 230, 53, 0.12) 0%, rgba(11, 19, 38, 0) 70%);
        }
        .glass-card {
          background: rgba(17, 17, 17, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .btn-glow:hover {
          box-shadow: 0 0 18px rgba(163, 230, 53, 0.4);
        }
      `}} />

      {/* Animated Circuit Background */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 circuit-bg-animate mix-blend-screen" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDQkoe0OUPUqyCCczk3B3hVt4zOFDMzCSt544vCURKwOxjvOrG-ec0HqURg47k0qt5rUZ00nmCQ2Q72b18IouRfjobjabscxF33Gr6BuTyzurfyk35OqVvhQB1h9ZpOd8tDaV4BC9wyB054TBtpwDN-SU7yhutvCLn85HfDgQkNOnCifQ7lp5ePeo-i9PkMpnmNRSZ-8WSc6daB0vWU9g4E8p02tDlWfkdCtdLOwXP6CgYhmUdhAF2G4a3d79qwaBN0zpW8wxLaeGY')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1326] via-[#0b1326]/50 to-[#0b1326]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1326] via-transparent to-[#0b1326]" />
      </div>
      <div className="absolute inset-0 hero-glow -z-10" />

      {/* Top Left Brand Header */}
      <Link href="/" className="absolute top-8 left-8 z-10 flex items-center gap-3 select-none cursor-pointer hover:opacity-90 transition-opacity">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-[#a3e635] shadow-lg shadow-[#a3e635]/15 shrink-0">
          <img src="/daddykart-new-logo.jpg" alt="Daddykart" className="w-full h-full object-cover object-top scale-110" />
        </div>
        <div>
          <span className="font-extrabold text-xl tracking-tight text-white">daddy<span className="text-[#a3e635]">kart</span></span>
          <p className="text-[9px] text-neutral-400 tracking-widest uppercase font-semibold">Cloud Storage</p>
        </div>
      </Link>

      {/* Next.js Logo Badge (Bottom Left) */}
      <div className="absolute bottom-8 left-8 z-10 hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-black text-white font-extrabold text-[10px] select-none shadow-md">
        N
      </div>

      {/* Login Card */}
      <main className="max-w-md w-full z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="glass-card rounded-[2rem] border-t-2 border-t-[#a3e635] p-8 md:p-10 shadow-[0_0_50px_rgba(163,230,53,0.15)] flex flex-col items-center text-center space-y-6 relative overflow-hidden"
        >
          {/* Card padlock icon */}
          <div className="border border-[#a3e635]/30 p-4 rounded-2xl bg-[#a3e635]/5 text-[#a3e635] shadow-lg shadow-[#a3e635]/5">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M12 17v-2" strokeLinecap="round" />
              <path d="M8 11V7a4 4 0 118 0v4" strokeLinecap="round" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="font-sans-stitch text-3xl font-extrabold text-white tracking-tight">Secure Portal Login</h2>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs font-sans-stitch">
              Access your commercial-grade cloud storage repository and real-time active storage pipeline.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs p-3.5 rounded-xl flex items-start gap-2 w-full text-left">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Actions */}
          <div className="w-full pt-2">
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-[#a3e635] hover:bg-[#b2f746] text-black font-extrabold py-4 px-6 rounded-full text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-[#a3e635]/15 btn-glow disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <ChromeSVG className="text-black" />
              )}
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </button>
          </div>

          {/* Card Footer Info */}
          <div className="flex justify-between items-center w-full pt-6 border-t border-white/5 text-[10px] text-neutral-500 font-mono tracking-wider uppercase font-bold">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border border-[#a3e635] flex items-center justify-center shrink-0">
                <div className="w-1 h-1 rounded-full bg-[#a3e635]" />
              </div>
              <span>End-to-end Encrypted</span>
            </div>
            <span>v1.2.0</span>
          </div>
        </motion.div>
      </main>

      {/* Page Copyright Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] text-neutral-500 font-sans-stitch font-bold tracking-wide select-none">
        © 2026 DaddyKart AI. All rights reserved. Secured by Google Identity.
      </div>

      {/* GOOGLE ACCOUNTS SIMULATOR POPUP */}
      <AnimatePresence>
        {showSimulator && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1A1A1A] border border-neutral-800 text-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              {/* Decorative accent */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#a3e635]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2.5 mb-6">
                <ChromeSVG className="text-[#a3e635]" />
                <h3 className="text-lg font-extrabold text-white">Google OAuth Sandbox</h3>
              </div>
              
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                Supabase environment keys are not configured. Select a mock Google Account to simulate a successful sign-in flow.
              </p>

              {/* Mock accounts list */}
              <div className="space-y-3 mb-6">
                {mockGoogleAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => handleSelectMockAccount(account)}
                    className="w-full flex items-center justify-between p-3.5 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700/80 rounded-2xl text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={account.avatar_url} 
                        alt={account.name} 
                        className="w-9 h-9 rounded-full object-cover border border-neutral-800"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-[#a3e635] transition-colors">{account.name}</h4>
                        <span className="text-[10px] text-neutral-400">{account.email}</span>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-lg bg-neutral-800 text-neutral-400 border border-neutral-800">
                      {account.tier}
                    </span>
                  </button>
                ))}
              </div>

              {/* Or divider */}
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-neutral-800/80"></div>
                <span className="flex-shrink mx-4 text-[10px] text-neutral-500 uppercase tracking-widest font-black">Or Custom Profile</span>
                <div className="flex-grow border-t border-neutral-800/80"></div>
              </div>

              {/* Custom login form */}
              <form onSubmit={handleCustomAccountSubmit} className="space-y-3 mt-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-black/40 border border-neutral-800/80 rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-[#a3e635] focus:border-[#a3e635] outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Google Email Address"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full bg-black/40 border border-neutral-800/80 rounded-xl p-3 text-xs text-white focus:ring-1 focus:ring-[#a3e635] focus:border-[#a3e635] outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!customName || !customEmail}
                  className="w-full bg-[#a3e635] text-black font-extrabold py-3 rounded-xl text-xs transition-colors disabled:opacity-50 hover:bg-[#b2f746]"
                >
                  Sign In Custom Account
                </button>
              </form>

              <button
                onClick={() => setShowSimulator(false)}
                className="w-full mt-6 py-2.5 border border-neutral-800 hover:bg-neutral-900 rounded-xl text-xs font-bold transition-colors text-neutral-500 hover:text-white"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Google G Logo SVG helper
function ChromeSVG({ className }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}
