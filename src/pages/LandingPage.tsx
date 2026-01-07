import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Droplets, Dumbbell, TrendingDown, Zap, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import proteinHero from "@/assets/protein-hero.jpg";
import electrolytesHero from "@/assets/electrolytes-hero.jpg";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-20"
        onLoadedData={(e) => {
          // Force play on mobile
          const video = e.currentTarget;
          video.play().catch(() => {
            // Silently fail if autoplay blocked
          });
        }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Enhanced Animated Gradient Mesh */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        {/* Primary glow - top right */}
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
        
        {/* Secondary glow - left side */}
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
        
        {/* Accent glow - bottom center */}
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

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-6 lg:p-8">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="/lovable-uploads/147a0591-cb92-4577-9a7e-31de1281abc2.png"
              alt="Intake"
              className="h-5 sm:h-6 lg:h-7 w-auto"
              style={{ filter: 'drop-shadow(0 0 8px #fff) drop-shadow(0 0 20px rgba(255,255,255,0.8))' }}
            />
          </motion.div>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-8 sm:py-12 lg:py-0">
          <div className="max-w-7xl mx-auto w-full">
            {/* Headline Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-8 sm:mb-12 lg:mb-14"
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/30 rounded-full px-5 py-2.5 mb-6 sm:mb-8 shadow-lg shadow-primary/10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary">Stop Overpaying for Supplements</span>
              </motion.div>
              
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-foreground mb-4 sm:mb-6 leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/80">
                  Find the Best Value
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-purple-600 animate-gradient">
                  Supplements in Seconds
                </span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-6">
                Compare 100+ products by real nutritional value, not just price.
              </p>
              <p className="text-foreground font-semibold text-lg sm:text-xl lg:text-2xl max-w-2xl mx-auto">
                Save money. Get better results. Make smarter choices.
              </p>

              {/* Trust Indicators */}
              <motion.div 
                className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Updated Daily</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>UK's Best Retailers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>100% Free</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto mb-10 sm:mb-14"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-primary to-purple-600 mb-1 sm:mb-2">
                  100+
                </div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Products Tracked</div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-green-500 to-emerald-600 mb-1 sm:mb-2">
                  £40+
                </div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Avg. Saved/Year</div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-500 to-cyan-600 mb-1 sm:mb-2">
                  24/7
                </div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Price Updates</div>
              </motion.div>
            </motion.div>

            {/* CTA Cards - HIGHLIGHTED */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto"
            >
              {/* Protein Card - ENHANCED */}
              <Link to="/protein" className="group block">
                <motion.div 
                  className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.5)] hover:scale-[1.03] hover:border-primary/70"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <img 
                      src={proteinHero} 
                      alt="Protein" 
                      className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
                  </div>

                  {/* Content */}
                  <div className="relative p-6 sm:p-8 lg:p-10">
                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-6">
                      <motion.div 
                        className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 border-2 border-primary/30 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/40 group-hover:scale-110 transition-all duration-300"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Dumbbell className="h-7 w-7 sm:h-9 sm:w-9 text-primary" />
                      </motion.div>
                      <div className="flex items-center gap-2 bg-green-500/20 border-2 border-green-500/40 rounded-full px-3 py-1.5 shadow-lg shadow-green-500/20">
                        <TrendingDown className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-xs font-bold text-green-600">Best Deals</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl sm:text-4xl font-black text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      Protein Powders
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
                      Compare 100+ protein supplements by grams per pound. Find scientifically-backed value for muscle growth and recovery.
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>Real-time price tracking</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>Intake Value™ ratings</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>Compare up to 4 products</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Button 
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold text-base sm:text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 border-0 group-hover:scale-105 transition-all duration-300"
                      >
                        <span>Explore Protein Supplements</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </Button>
                    </motion.div>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </motion.div>
              </Link>

              {/* Electrolytes Card - ENHANCED */}
              <Link to="/electrolytes" className="group block">
                <motion.div 
                  className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)] hover:scale-[1.03] hover:border-blue-500/70"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/5 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <img 
                      src={electrolytesHero} 
                      alt="Electrolytes" 
                      className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
                  </div>

                  {/* Content */}
                  <div className="relative p-6 sm:p-8 lg:p-10">
                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-6">
                      <motion.div 
                        className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-2 border-blue-500/30 shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-300"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Droplets className="h-7 w-7 sm:h-9 sm:w-9 text-blue-500" />
                      </motion.div>
                      <div className="flex items-center gap-2 bg-blue-500/20 border-2 border-blue-500/40 rounded-full px-3 py-1.5 shadow-lg shadow-blue-500/20">
                        <Zap className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs font-bold text-blue-600">Hydration</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl sm:text-4xl font-black text-foreground mb-3 group-hover:text-blue-500 transition-colors duration-300">
                      Electrolytes
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
                      Compare hydration supplements by electrolyte content. Optimize performance, recovery, and daily hydration.
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span>Na/K/Mg level analysis</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span>Cost per serving breakdown</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span>Subscription vs one-time pricing</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Button 
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-500/90 hover:to-cyan-600/90 text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 border-0 group-hover:scale-105 transition-all duration-300"
                      >
                        <span>Explore Electrolyte Supplements</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </Button>
                    </motion.div>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-4 sm:px-6 py-6 sm:py-8 text-center mt-auto">
          <motion.p 
            className="text-xs text-muted-foreground"
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
