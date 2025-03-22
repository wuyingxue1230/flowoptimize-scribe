
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Type, 
  Megaphone, 
  Target, 
  Zap,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export type OptimizationType = 
  | "improve" 
  | "simplify" 
  | "persuasive" 
  | "professional" 
  | "creative"
  | "custom";

interface PromptPanelProps {
  onSelectPrompt: (type: OptimizationType, customPrompt?: string) => void;
  selectedType: OptimizationType;
}

const promptDescriptions: Record<OptimizationType, string> = {
  improve: "General improvement for clarity and effectiveness",
  simplify: "Make the content easier to understand",
  persuasive: "Enhance persuasiveness and conversion potential",
  professional: "Refine for a professional, business context",
  creative: "Make the content more engaging and creative",
  custom: "Use your own custom prompt",
};

const PromptPanel: FC<PromptPanelProps> = ({ 
  onSelectPrompt,
  selectedType
}) => {
  const [expanded, setExpanded] = useState(true);
  const [customPrompt, setCustomPrompt] = useState("");
  
  const handleSelectPrompt = (type: OptimizationType) => {
    if (type === "custom") {
      onSelectPrompt(type, customPrompt);
    } else {
      onSelectPrompt(type);
    }
  };
  
  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomPrompt(e.target.value);
    if (selectedType === "custom") {
      onSelectPrompt("custom", e.target.value);
    }
  };
  
  return (
    <div className="w-full glass-card rounded-lg p-4 transition-all duration-300">
      <div 
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Optimization Options</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className={cn(
        "grid gap-4 transition-all duration-300 overflow-hidden",
        expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="min-h-0 overflow-hidden">
          <RadioGroup 
            value={selectedType} 
            onValueChange={(value) => handleSelectPrompt(value as OptimizationType)}
            className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3"
          >
            <div className={cn(
              "flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-all",
              selectedType === "improve" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}>
              <RadioGroupItem value="improve" id="improve" className="sr-only" />
              <Label 
                htmlFor="improve" 
                className="flex items-center cursor-pointer w-full"
              >
                <Zap className="h-4 w-4 mr-2 text-primary" />
                <span>Improve</span>
              </Label>
            </div>
            
            <div className={cn(
              "flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-all",
              selectedType === "simplify" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}>
              <RadioGroupItem value="simplify" id="simplify" className="sr-only" />
              <Label 
                htmlFor="simplify" 
                className="flex items-center cursor-pointer w-full"
              >
                <Type className="h-4 w-4 mr-2 text-primary" />
                <span>Simplify</span>
              </Label>
            </div>
            
            <div className={cn(
              "flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-all",
              selectedType === "persuasive" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}>
              <RadioGroupItem value="persuasive" id="persuasive" className="sr-only" />
              <Label 
                htmlFor="persuasive" 
                className="flex items-center cursor-pointer w-full"
              >
                <Megaphone className="h-4 w-4 mr-2 text-primary" />
                <span>Persuasive</span>
              </Label>
            </div>
            
            <div className={cn(
              "flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-all",
              selectedType === "professional" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}>
              <RadioGroupItem value="professional" id="professional" className="sr-only" />
              <Label 
                htmlFor="professional" 
                className="flex items-center cursor-pointer w-full"
              >
                <Target className="h-4 w-4 mr-2 text-primary" />
                <span>Professional</span>
              </Label>
            </div>
            
            <div className={cn(
              "flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-all",
              selectedType === "creative" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}>
              <RadioGroupItem value="creative" id="creative" className="sr-only" />
              <Label 
                htmlFor="creative" 
                className="flex items-center cursor-pointer w-full"
              >
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                <span>Creative</span>
              </Label>
            </div>
            
            <div className={cn(
              "flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-all",
              selectedType === "custom" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}>
              <RadioGroupItem value="custom" id="custom" className="sr-only" />
              <Label 
                htmlFor="custom" 
                className="flex items-center cursor-pointer w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                <span>Custom</span>
              </Label>
            </div>
          </RadioGroup>
          
          {selectedType !== "custom" && (
            <p className="text-sm text-muted-foreground animate-fade-in">
              {promptDescriptions[selectedType]}
            </p>
          )}
          
          {selectedType === "custom" && (
            <div className="animate-fade-in">
              <Textarea
                placeholder="Enter your custom optimization instructions..."
                className="w-full glass-input resize-none"
                value={customPrompt}
                onChange={handleCustomPromptChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptPanel;
