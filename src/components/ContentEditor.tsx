
import { FC, useState, useEffect } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, Copy, Check, RefreshCcw } from "lucide-react";

interface ContentEditorProps {
  initialContent?: string;
  onSubmit: (content: string) => void;
  isProcessing: boolean;
}

const ContentEditor: FC<ContentEditorProps> = ({ 
  initialContent = "",
  onSubmit,
  isProcessing 
}) => {
  const [content, setContent] = useState(initialContent);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);
  
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);
  
  const handleSubmit = () => {
    if (content.trim().length < 10) {
      toast.error("Please enter at least 10 characters");
      return;
    }
    onSubmit(content);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Content copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="chip">Original Content</div>
        <div className="text-xs text-muted-foreground">{charCount} characters</div>
      </div>
      
      <div className="relative flex-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your content here..."
          className="w-full h-full min-h-[250px] resize-none p-4 rounded-lg glass-input text-base focus-visible:ring-1 focus-visible:ring-primary transition-all duration-200"
        />
        
        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="glass h-8 w-8 p-0 rounded-full"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || content.trim().length < 10}
            className={cn(
              "glass h-8 rounded-full transition-all duration-300",
              isProcessing ? "w-8 p-0" : "w-auto px-3"
            )}
          >
            {isProcessing ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span className="mr-1">Optimize</span>
                <Send className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
