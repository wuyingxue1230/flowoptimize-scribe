
import { FC } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileText, History, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar: FC = () => {
  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 py-4 px-6 flex items-center justify-between border-b border-white/10 animate-fade-in">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <h1 className="font-semibold text-lg">FlowOptimize 写作助手</h1>
      </div>
      
      <div className="flex items-center space-x-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            cn("px-4 py-2 rounded-md transition-all duration-200", 
              isActive 
                ? "bg-secondary text-primary font-medium" 
                : "text-foreground/70 hover:bg-secondary/70")
          }
        >
          编辑器
        </NavLink>
        
        <NavLink 
          to="/history" 
          className={({ isActive }) => 
            cn("px-4 py-2 rounded-md transition-all duration-200", 
              isActive 
                ? "bg-secondary text-primary font-medium" 
                : "text-foreground/70 hover:bg-secondary/70")
          }
        >
          历史记录
        </NavLink>
        
        <Button variant="ghost" size="icon" className="ml-2">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
