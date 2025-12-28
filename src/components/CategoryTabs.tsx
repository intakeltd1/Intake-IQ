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
      "flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200",
      "relative border-b-2",
      isActive
        ? "text-foreground border-b-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.15),inset_0_-2px_10px_rgba(255,255,255,0.05)]"
        : "text-foreground/40 border-b-transparent hover:text-foreground/60 hover:bg-white/5"
    )}
  >
    <span className={cn(
      "transition-all duration-200",
      isActive ? "opacity-100 drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" : "opacity-50"
    )}>
      {icon}
    </span>
    <span className={cn(
      "font-medium transition-all duration-200",
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
    <div className="flex w-full bg-background/15 backdrop-blur-sm rounded-t-lg overflow-hidden">
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
