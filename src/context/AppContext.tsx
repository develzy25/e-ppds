'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, mockUsers } from '@/config/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  HelpCircle, 
  X
} from 'lucide-react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'anggaran' | 'perizinan' | 'mutasi' | 'umum';
  timestamp: string;
  isRead: boolean;
}

export interface ToastOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface PopupOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface AppContextType {
  currentUser: UserProfile;
  changeUser: (userId: string) => void;
  notifications: AppNotification[];
  addNotification: (title: string, message: string, category: AppNotification['category']) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  showToast: (options: ToastOptions) => void;
  showPopup: (options: PopupOptions) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Synthesized audio feedback (Web Audio API)
function playSynthSound(type: 'success' | 'error' | 'warning' | 'info' | 'confirm') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const playTone = (freq: number, start: number, duration: number, vol = 0.08) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };
    
    const now = ctx.currentTime;
    switch (type) {
      case 'success':
        playTone(1318.51, now, 0.25);
        playTone(1760.00, now + 0.08, 0.4);
        break;
      case 'error':
        playTone(392.00, now, 0.2, 0.1);
        playTone(293.66, now + 0.08, 0.35, 0.1);
        break;
      case 'warning':
        playTone(880.00, now, 0.12);
        playTone(880.00, now + 0.15, 0.12);
        break;
      case 'confirm':
        playTone(783.99, now, 0.2);
        playTone(1174.66, now + 0.08, 0.3);
        break;
      default: // info
        playTone(987.77, now, 0.2);
        playTone(1318.51, now + 0.08, 0.3);
        break;
    }
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}

// 3D Glassmorphism Icons
const render3dIcon = (type: 'success' | 'error' | 'warning' | 'info' | 'confirm', size: 'sm' | 'lg' = 'sm') => {
  const isLg = size === 'lg';
  const containerClass = isLg 
    ? "relative flex items-center justify-center h-16 w-16 rounded-2xl border bg-gradient-to-br transform -rotate-3 mb-4 select-none"
    : "relative flex items-center justify-center h-11 w-11 rounded-xl border bg-gradient-to-br transform -rotate-3 select-none flex-shrink-0";
    
  const iconClass = isLg ? "h-8 w-8 text-white drop-shadow-[0_2px_6px_rgba(255,255,255,0.5)]" : "h-5 w-5 text-white drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]";

  switch (type) {
    case 'success':
      return (
        <div className={`${containerClass} from-emerald-400 via-emerald-500 to-teal-600 border-emerald-300/30 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2),0_8px_16px_rgba(16,185,129,0.35)]`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.4),transparent_60%)]" />
          <Check className={iconClass} />
        </div>
      );
    case 'error':
      return (
        <div className={`${containerClass} from-rose-400 via-rose-500 to-red-600 border-rose-300/30 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2),0_8px_16px_rgba(244,63,94,0.35)]`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.4),transparent_60%)]" />
          <AlertOctagon className={iconClass} />
        </div>
      );
    case 'warning':
      return (
        <div className={`${containerClass} from-amber-400 via-amber-500 to-orange-600 border-amber-300/30 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2),0_8px_16px_rgba(245,158,11,0.35)]`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.45),transparent_60%)]" />
          <AlertTriangle className={iconClass} />
        </div>
      );
    case 'info':
      return (
        <div className={`${containerClass} from-sky-400 via-sky-500 to-blue-600 border-sky-300/30 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2),0_8px_16px_rgba(14,165,233,0.35)]`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.4),transparent_60%)]" />
          <Info className={iconClass} />
        </div>
      );
    case 'confirm':
      return (
        <div className={`${containerClass} from-purple-400 via-purple-500 to-indigo-600 border-purple-300/30 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2),0_8px_16px_rgba(168,85,247,0.35)]`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.4),transparent_60%)]" />
          <HelpCircle className={iconClass} />
        </div>
      );
  }
};

let idCounter = 0;
const generateUniqueId = (prefix: string) => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers[1]); // Default: M. Lulu (Sekretaris Umum & Ketua Blok)
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Real-time Notification States
  const [toasts, setToasts] = useState<({ id: string } & ToastOptions)[]>([]);
  const [popup, setPopup] = useState<PopupOptions | null>(null);
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);

  // Default mock notifications history
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'n-1',
      title: 'Pengajuan Dana Baru',
      message: 'Seksi Keamanan mengajukan dana seragam sebesar Rp 1.200.000.',
      category: 'anggaran',
      timestamp: '5 menit yang lalu',
      isRead: false
    },
    {
      id: 'n-2',
      title: 'Rekomendasi Izin Santri',
      message: 'Ahmad Rafli Fauzi meminta izin keluar pondok ke apotek.',
      category: 'perizinan',
      timestamp: '20 menit yang lalu',
      isRead: false
    },
    {
      id: 'n-3',
      title: 'Mutasi Anggota Baru',
      message: 'Kasie Media mengajukan permintaan mutasi anggota baru.',
      category: 'mutasi',
      timestamp: '1 jam yang lalu',
      isRead: true
    }
  ]);

  // Sync theme to document class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const changeUser = (userId: string) => {
    const foundUser = mockUsers.find(u => u.id === userId);
    if (foundUser) {
      setCurrentUser(foundUser);
      // Trigger notification for demo feedback
      addNotification(
        'Peran Berubah',
        `Sekarang bertindak sebagai ${foundUser.name}`,
        'umum'
      );
    }
  };

  const addNotification = (title: string, message: string, category: AppNotification['category']) => {
    const newNotif: AppNotification = {
      id: generateUniqueId('n'),
      title,
      message,
      category,
      timestamp: 'Baru saja',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Automatically trigger a premium toast for real-time visual feedback
    let toastType: 'success' | 'warning' | 'info' | 'error' = 'info';
    if (category === 'anggaran') toastType = 'success';
    else if (category === 'perizinan') toastType = 'warning';
    else if (category === 'mutasi') toastType = 'info';

    showToast({
      title,
      message,
      type: toastType
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Triggers Toast
  const showToast = (options: ToastOptions) => {
    const id = generateUniqueId('toast');
    const duration = options.duration || 4500;
    setToasts(prev => [...prev, { id, ...options, duration }]);
    if (soundEnabled) playSynthSound(options.type);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  // Triggers Center Screen Popup (Glassmorphic)
  const showPopup = (options: PopupOptions) => {
    setPopup(options);
    if (soundEnabled) playSynthSound(options.type);
    
    if (options.duration) {
      setTimeout(() => {
        setPopup(current => {
          if (current?.title === options.title) {
            if (options.onClose) options.onClose();
            return null;
          }
          return current;
        });
      }, options.duration);
    }
  };

  // Triggers Confirmation Dialog (Blocking Overlay)
  const showConfirm = (options: ConfirmOptions) => {
    setConfirm(options);
    if (soundEnabled) playSynthSound('confirm');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        changeUser,
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        isSidebarOpen,
        setSidebarOpen,
        theme,
        toggleTheme,
        soundEnabled,
        setSoundEnabled,
        showToast,
        showPopup,
        showConfirm
      }}
    >
      {children}

      {/* Global Real-time Toast Containers (Top Right) */}
      <div className="fixed top-4 right-4 z-99999 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.92 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative overflow-hidden flex items-start gap-3.5 p-4 rounded-2xl border border-white/20 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/75 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.12)] pointer-events-auto"
            >
              {render3dIcon(t.type, 'sm')}
              <div className="grow flex flex-col gap-0.5 justify-center pr-4">
                <h5 className="text-xs font-black tracking-wider uppercase text-foreground leading-tight">{t.title}</h5>
                <p className="text-[11px] text-muted-foreground font-medium leading-normal">{t.message}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToasts(prev => prev.filter(item => item.id !== t.id));
                }}
                className="text-muted-foreground/60 hover:text-foreground p-0.5 rounded-md hover:bg-secondary/40 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              
              {/* Toast Auto Close Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary/20">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: (t.duration || 4500) / 1000, ease: "linear" }}
                  className={`h-full bg-linear-to-r ${
                    t.type === 'success' ? 'from-emerald-400 to-teal-500' :
                    t.type === 'error' ? 'from-rose-400 to-red-500' :
                    t.type === 'warning' ? 'from-amber-400 to-orange-500' :
                    'from-sky-400 to-blue-500'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Global Center Screen Popup Notification (Glassmorphism 3D) */}
      <AnimatePresence>
        {popup && (
          <div className="fixed inset-0 flex items-center justify-center z-99990 pointer-events-auto">
            {/* Backdrop Blur + Transparency */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/15 dark:bg-black/40 backdrop-blur-[6px]"
              onClick={() => {
                if (popup.onClose) popup.onClose();
                setPopup(null);
              }}
            />

            {/* Popup Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative overflow-hidden flex flex-col items-center p-6 text-center max-w-sm w-full mx-4 rounded-[24px] border border-white/20 dark:border-neutral-850/80 bg-white/70 dark:bg-neutral-900/75 backdrop-blur-[20px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]"
            >
              {render3dIcon(popup.type, 'lg')}

              <h4 className="text-sm font-black tracking-wider uppercase text-foreground mb-1.5">{popup.title}</h4>
              <p className="text-xs text-muted-foreground font-medium mb-5 leading-relaxed">{popup.message}</p>

              <button
                onClick={() => {
                  if (popup.onClose) popup.onClose();
                  setPopup(null);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Tutup
              </button>

              {popup.duration && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary/10">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: popup.duration / 1000, ease: "linear" }}
                    className="h-full bg-linear-to-r from-primary to-accent"
                  />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Blocking Confirmation Dialog */}
      <AnimatePresence>
        {confirm && (
          <div className="fixed inset-0 flex items-center justify-center z-99995 pointer-events-auto">
            {/* Darker Backdrop Blur for blocking context */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/25 dark:bg-black/55 backdrop-blur-sm"
            />

            {/* Confirmation Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative overflow-hidden flex flex-col items-center p-6 text-center max-w-sm w-full mx-4 rounded-[24px] border border-white/20 dark:border-neutral-850/80 bg-white/70 dark:bg-neutral-900/75 backdrop-blur-[20px] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.22)] dark:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.65)]"
            >
              {render3dIcon(confirm.type === 'danger' ? 'error' : confirm.type, 'lg')}

              <h4 className="text-sm font-black tracking-wider uppercase text-foreground mb-1.5">{confirm.title}</h4>
              <p className="text-xs text-muted-foreground font-medium mb-6 leading-relaxed">{confirm.message}</p>

              <div className="flex gap-2.5 w-full">
                <button
                  onClick={() => {
                    if (confirm.onCancel) confirm.onCancel();
                    setConfirm(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-border/80 hover:bg-secondary/40 text-foreground transition-all"
                >
                  {confirm.cancelLabel || 'Batal'}
                </button>
                <button
                  onClick={() => {
                    confirm.onConfirm();
                    setConfirm(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all ${
                    confirm.type === 'danger' ? 'bg-rose-500 hover:bg-rose-600' :
                    confirm.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600' :
                    'bg-primary hover:bg-primary/95'
                  }`}
                >
                  {confirm.confirmLabel || 'Lanjutkan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
