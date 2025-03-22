
import { FC, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HistoryItem, { ContentHistory } from "@/components/HistoryItem";
import ContentComparison from "@/components/ContentComparison";
import { useContent } from "@/context/ContentContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, SlidersHorizontal, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const History: FC = () => {
  const {
    contentHistory,
    deleteHistoryItem,
    loadFromHistory
  } = useContent();
  
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<ContentHistory | null>(null);
  
  useEffect(() => {
    document.title = "FlowOptimize Scribe - History";
  }, []);
  
  const handleView = (item: ContentHistory) => {
    setSelectedItem(item);
  };
  
  const handleEdit = (item: ContentHistory) => {
    loadFromHistory(item);
    navigate("/");
  };
  
  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };
  
  const handleClearAll = () => {
    contentHistory.forEach(item => deleteHistoryItem(item.id));
    setSelectedItem(null);
  };
  
  if (contentHistory.length === 0) {
    return (
      <div className="min-h-screen pt-16 animate-fade-in">
        <Navbar />
        <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <h1 className="heading-1 mb-4">History</h1>
          <p className="text-muted-foreground mb-6">You don't have any saved optimizations yet.</p>
          <Button onClick={() => navigate("/")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Editor
          </Button>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-16 animate-fade-in">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading-1">History</h1>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="glass">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Clear History</DialogTitle>
              </DialogHeader>
              <p className="py-4">Are you sure you want to delete all history items? This action cannot be undone.</p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="glass">Cancel</Button>
                </DialogClose>
                <Button 
                  variant="destructive" 
                  onClick={handleClearAll}
                >
                  Delete All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {contentHistory.map(item => (
              <HistoryItem
                key={item.id}
                item={item}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isSelected={selectedItem?.id === item.id}
              />
            ))}
          </div>
          
          <div className="lg:col-span-2">
            {selectedItem ? (
              <div className="glass-card rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="chip">{selectedItem.type}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass"
                    onClick={() => handleEdit(selectedItem)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-1" />
                    Edit in Editor
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Original Content:</h3>
                    <div className="bg-white/50 dark:bg-black/20 rounded-md p-4 text-sm">
                      {selectedItem.original}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Optimized Content:</h3>
                    <div className="bg-white/50 dark:bg-black/20 rounded-md p-4 text-sm">
                      {selectedItem.optimized}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-lg p-6 flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">Select a history item to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
