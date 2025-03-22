
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
  
  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("contentHistory");
    if (savedHistory) {
      try {
        setContentHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse saved history:", error);
        localStorage.removeItem("contentHistory");
      }
    }
  }, []);
  
  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("contentHistory", JSON.stringify(contentHistory));
  }, [contentHistory]);
  
  const getPromptForType = (type: OptimizationType, customPromptValue: string): string => {
    switch (type) {
      case "improve":
        return "Improve this content for clarity and effectiveness, maintaining the original intent and tone:";
      case "simplify":
        return "Simplify this content to make it easier to understand, using plain language and shorter sentences:";
      case "persuasive":
        return "Make this content more persuasive and compelling to drive action:";
      case "professional":
        return "Refine this content for a professional business context, ensuring it's polished and formal:";
      case "creative":
        return "Make this content more creative, engaging, and memorable:";
      case "custom":
        return customPromptValue || "Please optimize this content based on custom instructions:";
    }
  };
  
  const optimizeContent = async (content: string) => {
    if (content.trim().length < 10) {
      toast.error("Content is too short to optimize");
      return;
    }
    
    setIsProcessing(true);
    setOriginalContent(content);
    
    try {
      // In a real app, this would call an AI service
      // For demo purposes, we'll simulate an API call with setTimeout
      const prompt = getPromptForType(currentPromptType, customPrompt);
      
      setTimeout(() => {
        // Simulate AI optimization (simple example - would be replaced with actual API)
        let optimized = simulateOptimization(content, currentPromptType);
        
        setOptimizedContent(optimized);
        setIsProcessing(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error optimizing content:", error);
      toast.error("Failed to optimize content. Please try again.");
      setIsProcessing(false);
    }
  };
  
  // This is just a simulation - would be replaced with actual AI in a real app
  const simulateOptimization = (content: string, type: OptimizationType): string => {
    switch (type) {
      case "improve":
        return content
          .split(". ")
          .map(sentence => sentence.trim())
          .filter(sentence => sentence.length > 0)
          .map(sentence => {
            // Add some variety to sentences
            if (sentence.length < 10) return sentence;
            if (Math.random() > 0.7) {
              return `Indeed, ${sentence.toLowerCase()}`;
            } else if (Math.random() > 0.5) {
              return `Notably, ${sentence.toLowerCase()}`;
            } else {
              return sentence.charAt(0).toUpperCase() + sentence.slice(1);
            }
          })
          .join(". ");
          
      case "simplify":
        return content
          .split(". ")
          .map(sentence => {
            // Simplify by shortening sentences
            if (sentence.length > 15) {
              const words = sentence.split(" ");
              if (words.length > 8) {
                return words.slice(0, 8).join(" ");
              }
            }
            return sentence;
          })
          .join(". ");
          
      case "persuasive":
        return `${content} This is a tremendous opportunity that you definitely shouldn't miss. Act now to secure these benefits right away!`;
        
      case "professional":
        return `We are pleased to provide the following information: ${content.replace(/I /g, "we ").replace(/My /g, "Our ")}. Please do not hesitate to contact us if you require any clarification.`;
        
      case "creative":
        return `Imagine a world where ${content.toLowerCase()} This fascinating possibility opens up endless opportunities for innovation and discovery!`;
        
      case "custom":
        // For custom, just add some editorial flourishes
        return `${content} [Custom optimization applied based on your specific instructions]`;
        
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
      toast.success("Content saved to history");
    }
  };
  
  const deleteHistoryItem = (id: string) => {
    setContentHistory(prev => prev.filter(item => item.id !== id));
    toast.success("History item deleted");
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
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
