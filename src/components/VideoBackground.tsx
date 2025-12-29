import { useRef, useEffect, useState } from 'react';

interface VideoBackgroundProps {
  className?: string;
}

export const VideoBackground = ({ className = '' }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Ensure video is muted (required for autoplay on most browsers)
    v.muted = true;
    v.setAttribute('muted', 'true');
    v.setAttribute('playsinline', 'true');
    v.setAttribute('webkit-playsinline', 'true');

    const attemptPlay = async () => {
      try {
        // Set current time to 0 to ensure we start from beginning
        v.currentTime = 0;
        await v.play();
        setIsPlaying(true);
      } catch (err) {
        // Retry with a slight delay for slower devices
        setTimeout(async () => {
          try {
            v.muted = true;
            await v.play();
            setIsPlaying(true);
          } catch {
            // Final fallback - try on user interaction
            const playOnInteraction = () => {
              v.play().then(() => setIsPlaying(true)).catch(() => {});
              document.removeEventListener('click', playOnInteraction);
              document.removeEventListener('touchstart', playOnInteraction);
            };
            document.addEventListener('click', playOnInteraction, { once: true });
            document.addEventListener('touchstart', playOnInteraction, { once: true });
          }
        }, 100);
      }
    };

    // Try to play immediately
    attemptPlay();

    // Also try when video data is loaded
    const handleCanPlay = () => {
      if (!isPlaying) {
        attemptPlay();
      }
    };

    v.addEventListener('canplay', handleCanPlay);
    v.addEventListener('loadeddata', handleCanPlay);

    return () => {
      v.removeEventListener('canplay', handleCanPlay);
      v.removeEventListener('loadeddata', handleCanPlay);
    };
  }, [isPlaying]);

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
        // Additional attributes for cross-browser compatibility
        {...{ 'webkit-playsinline': 'true' } as any}
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      
      {/* Subtle edge vignette for polish */}
      <div className="video-vignette" aria-hidden="true" />
    </>
  );
};

export default VideoBackground;
