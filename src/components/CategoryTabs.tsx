import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Dumbbell, Droplets } from "lucide-react";

interface TabProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const Tab = ({ to, label, icon, isActive }: TabProps) => (
  <Link
    to={to}
    className={cn(
      "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 rounded-t-xl border-t-2 border-l border-r",
      "min-h-[48px] text-center relative",
      isActive
        ? "bg-background/25 backdrop-blur-md border-t-primary border-l-white/40 border-r-white/40 text-foreground shadow-[0_-4px_20px_rgba(255,255,255,0.15)]"
        : "bg-background/5 border-t-transparent border-l-white/10 border-r-white/10 text-foreground/50 hover:text-foreground/80 hover:bg-background/15 hover:border-l-white/20 hover:border-r-white/20"
    )}
    style={{
      // Create the "connected to content" effect for active tab
      marginBottom: isActive ? "-1px" : "0",
    }}
  >
    <span className={cn(
      "transition-transform duration-300",
      isActive ? "scale-110" : "scale-100"
    )}>
      {icon}
    </span>
    <span className={cn(
      "font-semibold tracking-wide",
      isActive ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : ""
    )}>
      {label}
    </span>
  </Link>
);

const CategoryTabs = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isProteinActive = currentPath === "/protein" || currentPath === "/";
  const isElectrolytesActive = currentPath === "/electrolytes";

  return (
    <div className="flex w-full gap-1">
      <Tab
        to="/protein"
        label="Protein"
        icon={<Dumbbell className="h-4 w-4" />}
        isActive={isProteinActive}
      />
      <Tab
        to="/electrolytes"
        label="Electrolytes"
        icon={<Droplets className="h-4 w-4" />}
        isActive={isElectrolytesActive}
      />
    </div>
  );
};

export default CategoryTabs;
