import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TabProps {
  to: string;
  label: string;
  isActive: boolean;
}

const Tab = ({ to, label, isActive }: TabProps) => (
  <Link
    to={to}
    className={cn(
      "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg border-t border-l border-r",
      "min-w-[120px] text-center",
      isActive
        ? "bg-background/20 border-white/60 text-foreground shadow-[0_-2px_10px_rgba(255,255,255,0.15)] z-10"
        : "bg-background/5 border-white/20 text-foreground/50 hover:text-foreground/70 hover:bg-background/10 hover:border-white/30"
    )}
    style={{
      // Create the "connected to content" effect for active tab
      marginBottom: isActive ? "-1px" : "0",
    }}
  >
    {label}
  </Link>
);

const CategoryTabs = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isProteinActive = currentPath === "/protein" || currentPath === "/";
  const isElectrolytesActive = currentPath === "/electrolytes";

  return (
    <div className="flex items-end gap-1 mb-0">
      <Tab
        to="/protein"
        label="Protein"
        isActive={isProteinActive}
      />
      <Tab
        to="/electrolytes"
        label="Electrolytes"
        isActive={isElectrolytesActive}
      />
    </div>
  );
};

export default CategoryTabs;
