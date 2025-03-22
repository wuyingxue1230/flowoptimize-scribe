
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Info, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const UserGuide: FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "欢迎使用 FlowOptimize 写作助手",
      content: "这是一款简约的工具，旨在利用AI技术帮助您优化内容。"
    },
    {
      title: "1. 输入您的内容",
      content: "首先在编辑器中输入或粘贴您的内容。"
    },
    {
      title: "2. 选择优化类型",
      content: "从选项面板中选择您希望如何优化内容。"
    },
    {
      title: "3. 审阅并接受",
      content: "比较原始版本和优化版本，然后接受更改或重试。"
    },
    {
      title: "4. 访问历史记录",
      content: "所有优化记录都保存在历史记录选项卡中，以供将来参考。"
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
        使用指南
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
              下一步
              <ChevronRight className="h-3 w-3 ml-1" />
            </>
          ) : (
            "开始使用"
          )}
        </Button>
      </div>
    </div>
  );
};

export default UserGuide;
