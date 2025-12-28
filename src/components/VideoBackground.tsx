import { useRef, useEffect, useState, useCallback } from 'react';

interface VideoBackgroundProps {
  className?: string;
}

export const VideoBackground = ({ className = '' }: VideoBackgroundProps) => {
  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  const crossfadeDuration = 2000; // 2 seconds crossfade

  const handleTimeUpdate = useCallback(() => {
    const activeVideoRef = activeVideo === 1 ? video1Ref : video2Ref;
    const inactiveVideoRef = activeVideo === 1 ? video2Ref : video1Ref;
    const v = activeVideoRef.current;
    const v2 = inactiveVideoRef.current;
    
    if (!v || !v2) return;
    
    // Start crossfade 2 seconds before the end
    const timeRemaining = v.duration - v.currentTime;
    if (timeRemaining <= 2 && timeRemaining > 0) {
      // Reset and play the other video
      v2.currentTime = 0;
      v2.play().catch(() => {});
      
      // Switch active video
      setActiveVideo(activeVideo === 1 ? 2 : 1);
    }
  }, [activeVideo]);

  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    
    if (v1) {
      v1.muted = true;
      v1.play().catch(() => {});
    }
    if (v2) {
      v2.muted = true;
      v2.pause();
    }
  }, []);

  useEffect(() => {
    const activeVideoRef = activeVideo === 1 ? video1Ref : video2Ref;
    const v = activeVideoRef.current;
    
    if (v) {
      v.addEventListener('timeupdate', handleTimeUpdate);
      return () => v.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, [activeVideo, handleTimeUpdate]);

  return (
    <>
      <div className={`video-crossfade-container ${className}`}>
        <video
          ref={video1Ref}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          style={{ 
            opacity: activeVideo === 1 ? 0.6 : 0,
            transition: `opacity ${crossfadeDuration}ms ease-in-out`
          }}
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>
        <video
          ref={video2Ref}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          style={{ 
            opacity: activeVideo === 2 ? 0.6 : 0,
            transition: `opacity ${crossfadeDuration}ms ease-in-out`
          }}
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Video fade overlay for seamless edges */}
      <div className="video-fade-overlay" aria-hidden="true" />
    </>
  );
};

export default VideoBackground;
