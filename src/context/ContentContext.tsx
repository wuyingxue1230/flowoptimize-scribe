import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { OptimizationType } from "@/components/PromptPanel";
import { ContentHistory } from "@/components/HistoryItem";
import { analyzeText, optimizeText } from "@/lib/api";

// 定义用于高亮显示可修改部分的接口
export interface TextModification {
  original: string;
  reason: string;
  suggestion?: string;
  reasoning?: string; // 新增：优化思路
}

interface ContentContextProps {
  originalContent: string;
  optimizedContent: string;
  contentHistory: ContentHistory[];
  isProcessing: boolean;
  isStreaming: boolean;  // 新增：标识是否正在流式输出
  currentPromptType: OptimizationType;
  customPrompt: string;
  textModifications: TextModification[];
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
  const [isStreaming, setIsStreaming] = useState(false);  // 新增：流式输出状态
  const [currentPromptType, setCurrentPromptType] = useState<OptimizationType>("improve");
  const [customPrompt, setCustomPrompt] = useState("");
  const [contentHistory, setContentHistory] = useState<ContentHistory[]>([]);
  const [textModifications, setTextModifications] = useState<TextModification[]>([]);
  
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
  
  // 使用LLM分析文本的可修改部分
  const analyzeTextModifications = async (content: string): Promise<TextModification[]> => {
    try {
      const result = await analyzeText(content);
      return result.modifications || [];
    } catch (error) {
      console.error("LLM分析失败:", error);
      // 出错时返回空数组
      return [];
    }
  };
  
  // 清理文本内容，移除多余星号并保持分段
  const cleanTextContent = (text: string): string => {
    if (!text) return "";
    
    // 移除星号标记
    let cleaned = text.replace(/\*\*/g, ""); // 移除成对星号
    cleaned = cleaned.replace(/\*/g, "");    // 移除单个星号
    
    // 确保段落之间有空行
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n"); // 将多个空行替换为两个换行符
    
    return cleaned;
  };
  
  const optimizeContent = async (content: string) => {
    if (content.trim().length < 10) {
      toast.error("内容太短，无法优化");
      return;
    }
    
    setIsProcessing(true);
    setOriginalContent(content);
    setOptimizedContent(""); // 清空之前的结果
    setTextModifications([]); // 清空之前的修改建议
    
    try {
      // 初始化修改建议
      setTextModifications([{
        original: content,
        reason: "正在生成优化建议...",
        suggestion: ""
      }]);
      
      // 开始流式输出
      setIsStreaming(true);
      
      // 使用API优化内容，启用流式输出
      await optimizeText(
        content, 
        currentPromptType, 
        customPrompt,
        (chunkContent, suggestions) => {
          // 处理流式输出的回调函数
          const cleanedContent = cleanTextContent(chunkContent);
          setOptimizedContent(cleanedContent);
          
          // 如果有提供建议，则更新修改建议
          if (suggestions) {
            setTextModifications(suggestions);
          }
        }
      );
      
      // 流式输出完成
      setIsStreaming(false);
      
    } catch (error) {
      console.error("优化内容时出错:", error);
      toast.error("优化内容失败。请重试。");
      setIsStreaming(false);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const acceptOptimization = () => {
    if (optimizedContent) {
      // 确保接受的优化内容已清理
      const cleanedContent = cleanTextContent(optimizedContent);
      setOriginalContent(cleanedContent);
      setOptimizedContent("");
      saveToHistory();
      // 接受优化后清空修改建议
      setTextModifications([]);
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
      // 确保保存到历史记录的内容已清理
      const cleanedOptimized = cleanTextContent(optimizedContent);
      
      const newHistoryItem: ContentHistory = {
        id: Date.now().toString(),
        original: originalContent,
        optimized: cleanedOptimized,
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
    // 加载历史记录时清空修改建议
    setTextModifications([]);
  };
  
  return (
    <ContentContext.Provider
      value={{
        originalContent,
        optimizedContent,
        contentHistory,
        isProcessing,
        isStreaming,  // 新增：提供流式状态
        currentPromptType,
        customPrompt,
        textModifications,
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
