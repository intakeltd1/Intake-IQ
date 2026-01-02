import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const feedbackSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message too long')
});

interface FeedbackWidgetProps {
  onSuccess?: () => void;
}

export function FeedbackWidget({ onSuccess }: FeedbackWidgetProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = feedbackSchema.safeParse({ email, message });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    
    // Use mailto: link as a simple non-backend solution
    // This opens the user's email client with the feedback pre-filled
    const subject = encodeURIComponent('Intake IQ Feedback');
    const body = encodeURIComponent(`From: ${email}\n\nMessage:\n${message}`);
    const mailtoLink = `mailto:feedback@intakeltd.com?subject=${subject}&body=${body}`;
    
    // Open mailto link
    window.open(mailtoLink, '_blank');
    
    // Also store locally for reference
    try {
      const feedbackHistory = JSON.parse(localStorage.getItem('feedback-history') || '[]');
      feedbackHistory.push({
        email,
        message,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('feedback-history', JSON.stringify(feedbackHistory.slice(-10)));
    } catch {
      // Ignore storage errors
    }

    setLoading(false);
    setSent(true);
    
    setTimeout(() => {
      setEmail('');
      setMessage('');
      setSent(false);
      setExpanded(false);
      onSuccess?.();
    }, 2000);
  };

  if (sent) {
    return (
      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
        <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-green-600">Thanks for your feedback!</p>
        <p className="text-xs text-muted-foreground mt-1">Your email client should open with the message ready to send.</p>
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group text-left"
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          <div>
            <div className="font-medium text-foreground group-hover:text-primary">
              Send Feedback
            </div>
            <div className="text-xs text-muted-foreground">
              Help us improve Intake IQ
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Send Feedback</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-8 text-sm"
          disabled={loading}
        />
        <Textarea
          placeholder="Your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[80px] text-sm resize-none"
          disabled={loading}
        />
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => setExpanded(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="flex-1"
            disabled={loading || !email || !message}
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Send className="h-3 w-3 mr-1" />
                Send
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}