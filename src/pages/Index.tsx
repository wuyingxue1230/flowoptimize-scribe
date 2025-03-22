
import { FC, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ContentEditor from "@/components/ContentEditor";
import ContentComparison from "@/components/ContentComparison";
import PromptPanel from "@/components/PromptPanel";
import UserGuide from "@/components/UserGuide";
import { useContent } from "@/context/ContentContext";

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
    document.title = "FlowOptimize Scribe - Content Editor";
  }, []);
  
  return (
    <div className="min-h-screen pt-16 pb-6 animate-fade-in">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <header className="mb-6 text-center">
          <h1 className="heading-1 mb-2">Content Optimization</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Refine your content with AI assistance. Enter your text, select optimization options, and see the magic happen.
          </p>
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
