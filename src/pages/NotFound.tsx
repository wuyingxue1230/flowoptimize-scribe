
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 错误: 用户尝试访问不存在的路由:",
      location.pathname
    );
    
    document.title = "FlowOptimize Scribe - 页面未找到";
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4 animate-fade-in">
      <div className="glass-card p-8 rounded-lg max-w-md w-full text-center">
        <h1 className="heading-1 mb-2">404</h1>
        <p className="text-muted-foreground mb-6">
          您访问的页面不存在或已被移动。
        </p>
        <Button 
          onClick={() => navigate("/")}
          className="glass"
        >
          <Home className="h-4 w-4 mr-2" />
          返回首页
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
