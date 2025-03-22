
import { FC, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, ArrowDown, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentComparisonProps {
  original: string;
  optimized: string;
  isLoading?: boolean;
  onAccept: (content: string) => void;
}

const ContentComparison: FC<ContentComparisonProps> = ({
  original,
  optimized,
  isLoading = false,
  onAccept
}) => {
  const [copied, setCopied] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  useEffect(() => {
    if (optimized && !isLoading) {
      setTimeout(() => {
        setShowComparison(true);
      }, 300);
    } else {
      setShowComparison(false);
    }
  }, [optimized, isLoading]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(optimized);
    setCopied(true);
    toast.success("优化内容已复制到剪贴板");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleAccept = () => {
    onAccept(optimized);
    toast.success("已接受优化内容");
  };
  
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 glass-card rounded-lg animate-pulse">
        <RefreshCcw className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">正在优化内容...</p>
      </div>
    );
  }
  
  if (!optimized) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 glass-card rounded-lg">
        <ArrowDown className="h-8 w-8 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">优化后的内容将显示在这里</p>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "w-full h-full flex flex-col p-6 glass-card rounded-lg transition-all duration-500",
      showComparison ? "opacity-100" : "opacity-0"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="chip">优化结果</div>
        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">
          已改进
        </Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto rounded-md bg-white/50 dark:bg-black/20 p-4 mb-4 text-base">
        {optimized}
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="glass"
        >
          {copied ? (
            <Check className="h-4 w-4 mr-1 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 mr-1" />
          )}
          复制
        </Button>
        
        <Button
          onClick={handleAccept}
          className="glass bg-primary/90 text-white hover:bg-primary"
        >
          <Check className="h-4 w-4 mr-1" />
          接受
        </Button>
      </div>
    </div>
  );
};

export default ContentComparison;
