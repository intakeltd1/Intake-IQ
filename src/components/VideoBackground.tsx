import { useRef, useEffect } from 'react';

interface VideoBackgroundProps {
  className?: string;
}

export const VideoBackground = ({ className = '' }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    
    v.muted = true;
    v.play().catch(() => {
      // Retry with muted attribute set explicitly
      v.muted = true;
      v.setAttribute('muted', 'true');
      v.play().catch(() => {});
    });
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        className={`video-background ${className}`}
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      
      {/* Subtle edge vignette for polish */}
      <div className="video-vignette" aria-hidden="true" />
    </>
  );
};

export default VideoBackground;
