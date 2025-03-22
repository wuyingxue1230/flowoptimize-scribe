import { FC, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, ArrowDown, RefreshCcw, Lightbulb, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextModification } from "@/context/ContentContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useContent } from "@/context/ContentContext";

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
  const [showModifications, setShowModifications] = useState(false);
  const { textModifications, isStreaming } = useContent();
  
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
  
  const toggleModifications = () => {
    setShowModifications(!showModifications);
  };
  
  const renderTextModifications = () => {
    if (textModifications.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          暂无修改建议
        </div>
      );
    }
    
    // 只显示整体优化建议
    const mod = textModifications[0];
    
    return (
      <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md">
        <p className="font-medium mb-2">优化思路:</p>
        
        {isStreaming && !mod.reasoning ? (
          <p className="text-muted-foreground animate-pulse">正在生成优化思路...</p>
        ) : (
          <div className="text-amber-700 dark:text-amber-400 mb-4 whitespace-pre-line">
            {mod.reasoning || "无优化思路可显示"}
          </div>
        )}
        
        {isStreaming && !mod.suggestion ? (
          <p className="text-muted-foreground animate-pulse">正在生成优化内容...</p>
        ) : null}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 glass-card rounded-lg animate-pulse">
        <RefreshCcw className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">正在分析内容...</p>
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
        <div className="flex items-center space-x-2">
          {isStreaming && (
            <Badge variant="outline" className="text-xs animate-pulse bg-blue-500/10 text-blue-600 border-blue-200">
              正在生成...
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleModifications}
            className={cn(
              "h-7 w-7 rounded-full",
              showModifications && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            )}
            title="显示/隐藏优化思路"
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">
            已改进
          </Badge>
        </div>
      </div>
      
      {showModifications && textModifications.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-md border border-amber-200/50 dark:border-amber-800/30">
          <div className="flex items-center mb-2">
            <MessageCircle className="h-4 w-4 text-amber-600 mr-2" />
            <h4 className="text-sm font-medium">优化思路</h4>
          </div>
          <div>
            {renderTextModifications()}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto rounded-md bg-white/50 dark:bg-black/20 p-4 mb-4 text-base whitespace-pre-line">
        {optimized}
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse rounded-sm" />
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="glass"
          disabled={isStreaming}
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
          disabled={isStreaming}
        >
          <Check className="h-4 w-4 mr-1" />
          接受
        </Button>
      </div>
    </div>
  );
};

export default ContentComparison;
