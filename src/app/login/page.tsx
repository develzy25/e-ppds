'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BackgroundScene } from '@/components/ui/background-scene';
import { Sparkles, Delete } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [pin, setPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -4;
    const rotY = ((x - cx) / cx) * 4;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;

    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    glowRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 60%)`;
    glowRef.current.style.opacity = '1';
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current || !glowRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    glowRef.current.style.opacity = '0';
  }, []);

  const submitPin = useCallback(async (enteredPin: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredPin }),
      });
      const data = await res.json();
      
      if (!data.success) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setPin('');
        showToast({
          title: 'Akses Ditolak',
          message: data.error?.message || 'PIN yang dimasukkan salah.',
          type: 'error'
        });
        return;
      }

      showToast({
        title: 'Selamat Datang',
        message: 'Login sukses',
        type: 'success'
      });

      // Clear cookie and set new session, reload layout to fetch context
      window.location.href = '/dashboard/personal';
    } catch (err) {
      console.error(err);
      showToast({
        title: 'Gagal Login',
        message: 'Gagal memproses otentikasi PIN.',
        type: 'error'
      });
      setPin('');
    } finally {
      setIsSubmitting(false);
    }
  }, [showToast]);

  const handleKeypadPress = useCallback((digit: string) => {
    if (isSubmitting) return;
    setPin(prev => {
      if (prev.length < 6) {
        const next = prev + digit;
        if (next.length === 6) {
          submitPin(next);
        }
        return next;
      }
      return prev;
    });
  }, [isSubmitting, submitPin]);

  const handleBackspace = useCallback(() => {
    if (isSubmitting) return;
    setPin(prev => prev.slice(0, -1));
  }, [isSubmitting]);

  const handleClear = useCallback(() => {
    if (isSubmitting) return;
    setPin('');
  }, [isSubmitting]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeypadPress, handleBackspace, handleClear]);

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center p-4 bg-background overflow-hidden text-foreground">
      <BackgroundScene />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={isShaking ? { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          x: [-8, 8, -6, 6, -4, 4, 0] 
        } : { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          x: 0 
        }}
        transition={isShaking ? { duration: 0.4 } : { duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="perspective-container z-10 w-full max-w-sm"
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 glass-premium shadow-premium p-8 cursor-default transition-transform duration-300 ease-out"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            ref={glowRef}
            className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
            style={{ opacity: 0, zIndex: 0 }}
          />

          <div className="absolute top-0 left-6 right-6 h-[2px] bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />

          {/* Logo Section */}
          <div className="flex flex-col items-center text-center gap-3 mb-6" style={{ transform: 'translateZ(15px)' }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl -m-3" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-login.png"
                alt="Logo Login"
                className="h-16 w-16 object-contain float-anim"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tight text-foreground flex items-center justify-center gap-1.5">
                Login SIM-PPDS
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </h2>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Masukkan 6 Digit PIN Pengurus
              </p>
            </div>
          </div>

          {/* PIN Indicators */}
          <div className="flex justify-center gap-3.5 my-6" style={{ transform: 'translateZ(10px)' }}>
            {Array.from({ length: 6 }).map((_, idx) => {
              const hasDigit = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    hasDigit
                      ? 'bg-primary border-primary scale-110 shadow-[0_0_12px_var(--primary)]'
                      : 'bg-secondary/20 border-border/40'
                  }`}
                />
              );
            })}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3.5 max-w-[260px] mx-auto mb-6" style={{ transform: 'translateZ(5px)' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num.toString())}
                disabled={isSubmitting}
                className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-black border border-border/20 bg-secondary/10 hover:bg-secondary/30 active:scale-90 disabled:opacity-50 transition-all cursor-pointer select-none"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              disabled={isSubmitting}
              className="h-12 w-12 rounded-full flex items-center justify-center text-[9px] font-black uppercase tracking-wider text-muted-foreground/80 hover:bg-secondary/20 active:scale-90 disabled:opacity-50 transition-all cursor-pointer select-none"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              disabled={isSubmitting}
              className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-black border border-border/20 bg-secondary/10 hover:bg-secondary/30 active:scale-90 disabled:opacity-50 transition-all cursor-pointer select-none"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              disabled={isSubmitting}
              className="h-12 w-12 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary/20 active:scale-90 disabled:opacity-50 transition-all cursor-pointer select-none"
            >
              <Delete className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
