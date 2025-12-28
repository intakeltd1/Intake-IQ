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
      "relative",
      isActive
        ? "text-foreground"
        : "text-foreground/40 hover:text-foreground/70"
    )}
  >
    <span className={cn(
      "transition-opacity duration-200",
      isActive ? "opacity-100" : "opacity-50"
    )}>
      {icon}
    </span>
    <span className="font-medium">
      {label}
    </span>
    {/* Active indicator line */}
    {isActive && (
      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-white rounded-full" />
    )}
  </Link>
);

const CategoryTabs = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isProteinActive = currentPath === "/protein" || currentPath === "/";
  const isElectrolytesActive = currentPath === "/electrolytes";

  return (
    <div className="flex w-full bg-background/10 backdrop-blur-sm rounded-t-lg border-b border-white/10">
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
