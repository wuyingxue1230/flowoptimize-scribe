
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Info, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const UserGuide: FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to FlowOptimize Scribe",
      content: "A minimalist tool designed to help you optimize your content with AI assistance."
    },
    {
      title: "1. Enter your content",
      content: "Start by typing or pasting your content in the editor."
    },
    {
      title: "2. Choose optimization type",
      content: "Select how you'd like to optimize your content from the options panel."
    },
    {
      title: "3. Review and accept",
      content: "Compare the original and optimized versions, then accept the changes or try again."
    },
    {
      title: "4. Access history",
      content: "All your optimizations are saved in the history tab for future reference."
    }
  ];
  
  const handleNextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsOpen(false);
    }
  };
  
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 glass-card rounded-full"
        onClick={() => {
          setIsOpen(true);
          setStep(0);
        }}
      >
        <Info className="h-4 w-4 mr-1" />
        Guide
      </Button>
    );
  }
  
  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 p-4 glass-card rounded-lg shadow-lg w-full max-w-sm transition-all duration-300 animate-scale-in"
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm">{steps[step].title}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        {steps[step].content}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {steps.map((_, i) => (
            <div 
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                i === step ? "bg-primary w-3" : "bg-muted"
              )}
            />
          ))}
        </div>
        
        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={handleNextStep}
        >
          {step < steps.length - 1 ? (
            <>
              Next
              <ChevronRight className="h-3 w-3 ml-1" />
            </>
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </div>
  );
};

export default UserGuide;
