import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Droplets, Dumbbell, TrendingDown, Zap, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import proteinHero from "@/assets/protein-hero.jpg";
import electrolytesHero from "@/assets/electrolytes-hero.jpg";

const LandingPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // AGGRESSIVE video autoplay - multiple attempts
    const playVideo = () => {
      if (videoRef.current) {
        videoRef.current.muted = true; // Ensure muted
        videoRef.current.playsInline = true; // Critical for iOS
        
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Video autoplay successful");
            })
            .catch((error) => {
              console.log("Autoplay prevented, retrying...", error);
              // Retry after a brief delay
              setTimeout(() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {
                    console.log("Second attempt failed");
                  });
                }
              }, 100);
            });
        }
      }
    };

    // Try immediately
    playVideo();

    // Try again on various events
    const events = ['loadeddata', 'canplay', 'canplaythrough'];
    events.forEach(event => {
      videoRef.current?.addEventListener(event, playVideo);
    });

    // Try on user interaction (backup)
    const handleInteraction = () => {
      playVideo();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    // Cleanup
    return () => {
      events.forEach(event => {
        videoRef.current?.removeEventListener(event, playVideo);
      });
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 relative overflow-hidden">
      {/* GUARANTEED AUTOPLAY Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-20"
        style={{ 
          pointerEvents: 'none',
          WebkitPlaysinline: true as any,
        }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>

      {/* Enhanced Animated Gradient Mesh */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-transparent blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-transparent blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        <motion.div
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-t from-primary/25 via-primary/10 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Content - OPTIMIZED SPACING */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header - Compact */}
        <header className="flex items-center justify-between p-3 sm:p-4 lg:p-5">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="/lovable-uploads/147a0591-cb92-4577-9a7e-31de1281abc2.png"
              alt="Intake"
              className="h-5 sm:h-6 w-auto"
              style={{ filter: 'drop-shadow(0 0 8px #fff) drop-shadow(0 0 20px rgba(255,255,255,0.8))' }}
            />
          </motion.div>
        </header>

        {/* Hero Section - Vertically Centered */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Headline Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center space-y-3 sm:space-y-4"
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/30 rounded-full px-4 py-2 shadow-lg shadow-primary/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-primary">Stop Overpaying for Supplements</span>
              </motion.div>
              
              {/* Main Headline - Optimized sizing */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] px-4">
                <span className="block">Find the Best Value</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-purple-600">
                  Supplements in Seconds
                </span>
              </h1>
              
              {/* Subheadline - Tighter spacing */}
              <div className="space-y-2 max-w-2xl mx-auto px-4">
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                  Compare 100+ products by real nutritional value, not just price.
                </p>
                <p className="text-foreground font-semibold text-base sm:text-lg lg:text-xl">
                  Save money. Get better results. Make smarter choices.
                </p>
              </div>

              {/* Trust Indicators - Compact */}
              <motion.div 
                className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2 text-xs sm:text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>Updated Daily</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>UK's Best Retailers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>100% Free</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Stats Bar - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto px-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all"
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-primary to-purple-600 mb-1">
                  100+
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground leading-tight">Products Tracked</div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all"
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-green-500 to-emerald-600 mb-1">
                  £40+
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground leading-tight">Avg. Saved/Year</div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all"
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-cyan-600 mb-1">
                  24/7
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground leading-tight">Price Updates</div>
              </motion.div>
            </motion.div>

            {/* CTA Cards - Optimized Sizing */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto px-4"
            >
              {/* Protein Card */}
              <Link to="/protein" className="group block">
                <motion.div 
                  className="relative overflow-hidden rounded-2xl lg:rounded-3xl border-2 border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.5)] hover:scale-[1.03] hover:border-primary/70"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <img 
                      src={proteinHero} 
                      alt="Protein" 
                      className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
                  </div>

                  <div className="relative p-5 sm:p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-4 sm:mb-5">
                      <motion.div 
                        className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 border-2 border-primary/30 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/40 group-hover:scale-110 transition-all duration-300"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Dumbbell className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                      </motion.div>
                      <div className="flex items-center gap-1.5 bg-green-500/20 border-2 border-green-500/40 rounded-full px-2.5 py-1 shadow-lg shadow-green-500/20">
                        <TrendingDown className="h-3 w-3 text-green-500" />
                        <span className="text-[10px] sm:text-xs font-bold text-green-600">Best Deals</span>
                      </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300">
                      Protein Powders
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 sm:mb-5 text-xs sm:text-sm leading-relaxed">
                      Compare 100+ protein supplements by grams per pound. Find scientifically-backed value for muscle growth.
                    </p>

                    <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span>Real-time price tracking</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span>Intake Value™ ratings</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span>Compare up to 4 products</span>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Button 
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold text-sm sm:text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 border-0 group-hover:scale-105 transition-all duration-300"
                      >
                        <span>Explore Protein Supplements</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </Button>
                    </motion.div>
                  </div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </motion.div>
              </Link>

              {/* Electrolytes Card */}
              <Link to="/electrolytes" className="group block">
                <motion.div 
                  className="relative overflow-hidden rounded-2xl lg:rounded-3xl border-2 border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)] hover:scale-[1.03] hover:border-blue-500/70"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/5 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <img 
                      src={electrolytesHero} 
                      alt="Electrolytes" 
                      className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
                  </div>

                  <div className="relative p-5 sm:p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-4 sm:mb-5">
                      <motion.div 
                        className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-2 border-blue-500/30 shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-300"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Droplets className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
                      </motion.div>
                      <div className="flex items-center gap-1.5 bg-blue-500/20 border-2 border-blue-500/40 rounded-full px-2.5 py-1 shadow-lg shadow-blue-500/20">
                        <Zap className="h-3 w-3 text-blue-500" />
                        <span className="text-[10px] sm:text-xs font-bold text-blue-600">Hydration</span>
                      </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-2 sm:mb-3 group-hover:text-blue-500 transition-colors duration-300">
                      Electrolytes
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 sm:mb-5 text-xs sm:text-sm leading-relaxed">
                      Compare hydration supplements by electrolyte content. Optimize performance, recovery, and daily hydration.
                    </p>

                    <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                        <span>Na/K/Mg level analysis</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                        <span>Cost per serving breakdown</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                        <span>Subscription vs one-time pricing</span>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Button 
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-500/90 hover:to-cyan-600/90 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 border-0 group-hover:scale-105 transition-all duration-300"
                      >
                        <span>Explore Electrolyte Supplements</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </Button>
                    </motion.div>
                  </div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Footer - Minimal */}
        <footer className="px-4 py-3 sm:py-4 text-center">
          <motion.p 
            className="text-[10px] sm:text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            © {new Date().getFullYear()} Intake Ltd. All rights reserved.
          </motion.p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
