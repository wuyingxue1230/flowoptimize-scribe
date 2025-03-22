
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { OptimizationType } from "@/components/PromptPanel";
import { ContentHistory } from "@/components/HistoryItem";

interface ContentContextProps {
  originalContent: string;
  optimizedContent: string;
  contentHistory: ContentHistory[];
  isProcessing: boolean;
  currentPromptType: OptimizationType;
  customPrompt: string;
  setOriginalContent: (content: string) => void;
  setOptimizedContent: (content: string) => void;
  optimizeContent: (content: string) => void;
  acceptOptimization: () => void;
  setPromptType: (type: OptimizationType, customPrompt?: string) => void;
  saveToHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  loadFromHistory: (item: ContentHistory) => void;
}

const ContentContext = createContext<ContentContextProps | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [originalContent, setOriginalContent] = useState("");
  const [optimizedContent, setOptimizedContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPromptType, setCurrentPromptType] = useState<OptimizationType>("improve");
  const [customPrompt, setCustomPrompt] = useState("");
  const [contentHistory, setContentHistory] = useState<ContentHistory[]>([]);
  
  // 在挂载时从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem("contentHistory");
    if (savedHistory) {
      try {
        setContentHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("解析保存的历史记录失败:", error);
        localStorage.removeItem("contentHistory");
      }
    }
  }, []);
  
  // 在历史记录变化时保存到localStorage
  useEffect(() => {
    localStorage.setItem("contentHistory", JSON.stringify(contentHistory));
  }, [contentHistory]);
  
  const getPromptForType = (type: OptimizationType, customPromptValue: string): string => {
    switch (type) {
      case "improve":
        return "改进这段内容，提高清晰度和效果，同时保持原始意图和语调:";
      case "simplify":
        return "简化这段内容，使用简单语言和较短句子，让它更容易理解:";
      case "persuasive":
        return "让这段内容更有说服力和吸引力，以促使读者采取行动:";
      case "professional":
        return "将这段内容调整为专业商务风格，确保它精炼且正式:";
      case "creative":
        return "让这段内容更有创意，更吸引人，更令人难忘:";
      case "custom":
        return customPromptValue || "请根据自定义指令优化这段内容:";
    }
  };
  
  const optimizeContent = async (content: string) => {
    if (content.trim().length < 10) {
      toast.error("内容太短，无法优化");
      return;
    }
    
    setIsProcessing(true);
    setOriginalContent(content);
    
    try {
      // 在实际应用中，这里会调用AI服务
      // 为了演示目的，我们用setTimeout模拟API调用
      const prompt = getPromptForType(currentPromptType, customPrompt);
      
      setTimeout(() => {
        // 模拟AI优化（简单示例 - 会被实际API替换）
        let optimized = simulateOptimization(content, currentPromptType);
        
        setOptimizedContent(optimized);
        setIsProcessing(false);
      }, 2000);
      
    } catch (error) {
      console.error("优化内容时出错:", error);
      toast.error("优化内容失败。请重试。");
      setIsProcessing(false);
    }
  };
  
  // 这只是一个模拟 - 在实际应用中会被真正的AI替换
  const simulateOptimization = (content: string, type: OptimizationType): string => {
    switch (type) {
      case "improve":
        return content
          .split("。 ")
          .map(sentence => sentence.trim())
          .filter(sentence => sentence.length > 0)
          .map(sentence => {
            // 为句子添加一些变化
            if (sentence.length < 10) return sentence;
            if (Math.random() > 0.7) {
              return `确实，${sentence.toLowerCase()}`;
            } else if (Math.random() > 0.5) {
              return `值得注意的是，${sentence.toLowerCase()}`;
            } else {
              return sentence.charAt(0).toUpperCase() + sentence.slice(1);
            }
          })
          .join("。 ");
          
      case "simplify":
        return content
          .split("。 ")
          .map(sentence => {
            // 通过缩短句子来简化
            if (sentence.length > 15) {
              const words = sentence.split(" ");
              if (words.length > 8) {
                return words.slice(0, 8).join(" ");
              }
            }
            return sentence;
          })
          .join("。 ");
          
      case "persuasive":
        return `${content} 这是一个绝佳的机会，您绝对不应该错过。立即行动以确保这些好处！`;
        
      case "professional":
        return `我们很高兴提供以下信息：${content.replace(/我 /g, "我们 ").replace(/我的 /g, "我们的 ")}。如果您需要任何澄清，请随时与我们联系。`;
        
      case "creative":
        return `想象一个${content.toLowerCase()}的世界。这个迷人的可能性为创新和发现开辟了无限机会！`;
        
      case "custom":
        // 对于自定义，只是添加一些编辑修饰
        return `${content} [根据您的具体指示应用了自定义优化]`;
        
      default:
        return content;
    }
  };
  
  const acceptOptimization = () => {
    if (optimizedContent) {
      setOriginalContent(optimizedContent);
      setOptimizedContent("");
      saveToHistory();
    }
  };
  
  const setPromptType = (type: OptimizationType, prompt?: string) => {
    setCurrentPromptType(type);
    if (type === "custom" && prompt !== undefined) {
      setCustomPrompt(prompt);
    }
  };
  
  const saveToHistory = () => {
    if (originalContent && optimizedContent) {
      const newHistoryItem: ContentHistory = {
        id: Date.now().toString(),
        original: originalContent,
        optimized: optimizedContent,
        timestamp: Date.now(),
        type: currentPromptType
      };
      
      setContentHistory(prev => [newHistoryItem, ...prev]);
      toast.success("内容已保存到历史记录");
    }
  };
  
  const deleteHistoryItem = (id: string) => {
    setContentHistory(prev => prev.filter(item => item.id !== id));
    toast.success("历史记录项已删除");
  };
  
  const loadFromHistory = (item: ContentHistory) => {
    setOriginalContent(item.original);
    setOptimizedContent(item.optimized);
    setCurrentPromptType(item.type as OptimizationType);
  };
  
  return (
    <ContentContext.Provider
      value={{
        originalContent,
        optimizedContent,
        contentHistory,
        isProcessing,
        currentPromptType,
        customPrompt,
        setOriginalContent,
        setOptimizedContent,
        optimizeContent,
        acceptOptimization,
        setPromptType,
        saveToHistory,
        deleteHistoryItem,
        loadFromHistory
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent必须在ContentProvider内部使用");
  }
  return context;
};
