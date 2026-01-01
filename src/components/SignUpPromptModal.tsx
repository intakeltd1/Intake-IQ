import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  CheckCircle, 
  Loader2, 
  Bell, 
  TrendingDown, 
  Heart, 
  Zap,
  ChartLine,
  Star
} from 'lucide-react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

const emailSchema = z.string().email('Please enter a valid email address');

const SIGNUP_PROMPT_COOKIE = 'signup-prompt-shown';
const TIME_TRIGGER_MS = 2 * 60 * 1000; // 2 minutes

interface SignUpPromptModalProps {
  triggerOnComparisonCount?: number;
  triggerOnSearch?: boolean;
}

export function SignUpPromptModal({ 
  triggerOnComparisonCount = 0, 
  triggerOnSearch = false 
}: SignUpPromptModalProps) {
  const { user, signInWithMagicLink } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Check if we should show the prompt (first visit only)
  const shouldShowPrompt = useCallback(() => {
    if (user) return false;
    if (hasTriggered) return false;
    
    try {
      const shown = localStorage.getItem(SIGNUP_PROMPT_COOKIE);
      return !shown;
    } catch {
      return true;
    }
  }, [user, hasTriggered]);

  const triggerPrompt = useCallback(() => {
    if (!shouldShowPrompt()) return;
    
    setHasTriggered(true);
    setOpen(true);
    
    try {
      localStorage.setItem(SIGNUP_PROMPT_COOKIE, 'true');
    } catch {
      // Ignore storage errors
    }
  }, [shouldShowPrompt]);

  // Time-based trigger (2+ minutes on site)
  useEffect(() => {
    if (user) return;
    
    const timer = setTimeout(() => {
      triggerPrompt();
    }, TIME_TRIGGER_MS);

    return () => clearTimeout(timer);
  }, [user, triggerPrompt]);

  // Comparison count trigger (2+ items)
  useEffect(() => {
    if (triggerOnComparisonCount >= 2) {
      triggerPrompt();
    }
  }, [triggerOnComparisonCount, triggerPrompt]);

  // Search trigger
  useEffect(() => {
    if (triggerOnSearch) {
      triggerPrompt();
    }
  }, [triggerOnSearch, triggerPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    
    const { error } = await signInWithMagicLink(email);
    
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setEmail('');
      setSent(false);
      setError(null);
    }, 200);
  };

  const benefits = [
    {
      icon: Bell,
      title: 'Price Drop Alerts',
      description: 'Get notified when your favourites drop in price',
      color: 'from-amber-400 to-orange-500'
    },
    {
      icon: TrendingDown,
      title: '30-Day Price History',
      description: 'See price trends and buy at the right time',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Heart,
      title: 'Save Favourites',
      description: 'Track products across all your devices',
      color: 'from-pink-400 to-rose-500'
    },
    {
      icon: Zap,
      title: 'Daily Updates',
      description: 'Fresh prices and stock levels every day',
      color: 'from-purple-400 to-violet-500'
    }
  ];

  if (user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-2 border-primary/20 bg-gradient-to-b from-background to-card">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </motion.div>
              <DialogHeader>
                <DialogTitle className="text-2xl">Check your email!</DialogTitle>
              </DialogHeader>
              <p className="text-muted-foreground mt-3">
                We've sent a magic link to <span className="font-semibold text-foreground">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Click the link to start saving your favorites and getting price alerts.
              </p>
              <Button variant="outline" className="mt-6" onClick={handleClose}>
                Close
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header with gradient */}
              <div className="relative px-6 pt-8 pb-6 text-center bg-gradient-to-b from-primary/10 to-transparent">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="mx-auto mb-4 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/30"
                >
                  <Star className="h-7 w-7 text-primary-foreground" />
                </motion.div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    Unlock Premium Features
                  </DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground mt-2 text-sm">
                  Join thousands of smart supplement shoppers
                </p>
              </div>

              {/* Benefits grid */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.1 }}
                      className="relative p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
                        <benefit.icon className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-sm text-foreground">{benefit.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{benefit.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Email form */}
              <motion.form 
                onSubmit={handleSubmit} 
                className="px-6 pb-6 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 text-base bg-background/50 border-border/50 focus:border-primary"
                      disabled={loading}
                    />
                  </div>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-destructive"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600 transition-all" 
                  disabled={loading || !email}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Get Started Free
                      <ChartLine className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  No password needed—we'll email you a secure link
                </p>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
