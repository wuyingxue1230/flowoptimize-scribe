
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContentHistory {
  id: string;
  original: string;
  optimized: string;
  timestamp: number;
  type: string;
}

interface HistoryItemProps {
  item: ContentHistory;
  onView: (item: ContentHistory) => void;
  onEdit: (item: ContentHistory) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}

const HistoryItem: FC<HistoryItemProps> = ({
  item,
  onView,
  onEdit,
  onDelete,
  isSelected
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  
  return (
    <div 
      className={cn(
        "glass-card rounded-lg p-4 transition-all duration-200 hover:shadow-md",
        isSelected ? "ring-2 ring-primary" : ""
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="chip">{item.type}</div>
        <span className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</span>
      </div>
      
      <p className="text-sm mb-4 line-clamp-2">
        {truncateText(item.original)}
      </p>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="glass h-8"
          onClick={() => onView(item)}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          查看
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="glass h-8"
          onClick={() => onEdit(item)}
        >
          <Edit className="h-3.5 w-3.5 mr-1" />
          编辑
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="glass h-8 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default HistoryItem;
