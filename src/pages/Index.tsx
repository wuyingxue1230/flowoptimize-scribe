import { FC, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ContentEditor from "@/components/ContentEditor";
import ContentComparison from "@/components/ContentComparison";
import PromptPanel from "@/components/PromptPanel";
import UserGuide from "@/components/UserGuide";
import { useContent } from "@/context/ContentContext";
import { Sparkles } from "lucide-react";

const Index: FC = () => {
  const {
    originalContent,
    optimizedContent,
    isProcessing,
    currentPromptType,
    optimizeContent,
    acceptOptimization,
    setPromptType
  } = useContent();
  
  useEffect(() => {
    document.title = "FlowOptimize 写作助手 - 内容编辑";
  }, []);
  
  return (
    <div className="min-h-screen pt-16 pb-6 animate-fade-in">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <header className="mb-6 text-center">
          <h1 className="heading-1 mb-2">内容优化工具</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            利用AI辅助优化您的内容。输入文本，选择优化选项，通过LLM分析原文可修改部分并回复优化结果。
          </p>
          <div className="inline-flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/40 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            支持流式生成，实时查看AI优化过程
          </div>
        </header>
        
        <PromptPanel 
          onSelectPrompt={setPromptType}
          selectedType={currentPromptType}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ContentEditor 
            initialContent={originalContent}
            onSubmit={optimizeContent}
            isProcessing={isProcessing}
          />
          
          <ContentComparison 
            original={originalContent}
            optimized={optimizedContent}
            isLoading={isProcessing}
            onAccept={acceptOptimization}
          />
        </div>
      </main>
      
      <UserGuide />
    </div>
  );
};

export default Index;
