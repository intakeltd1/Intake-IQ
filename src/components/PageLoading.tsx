import { useRef, useEffect } from 'react';

interface PageLoadingProps {
  message?: string;
  subtitle?: string;
}

export const PageLoading = ({ 
  message = "Loading Products...", 
  subtitle = "Fetching the latest supplement prices and information" 
}: PageLoadingProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden page-transition">
      {/* Video Background */}
      <video 
        ref={videoRef}
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
        disablePictureInPicture
        aria-hidden="true"
        className="video-background"
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      
      {/* Vignette overlay */}
      <div className="video-vignette" aria-hidden="true" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 animate-fade-in">
          {/* Spinner */}
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
          </div>
          
          {/* Text */}
          <div className="space-y-2">
            <p className="text-xl font-bold text-foreground drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
              {message}
            </p>
            <p className="text-sm text-foreground/80 drop-shadow-[0_0_4px_rgba(0,0,0,0.6)]">
              {subtitle}
            </p>
          </div>
          
          {/* Bouncing dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoading;
