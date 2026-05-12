import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Car } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="text-center max-w-md">
        <p className="text-[140px] font-display font-bold leading-none bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
          404
        </p>
        <h1 className="text-2xl font-display font-bold mt-2">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground mt-2 text-sm break-all">
          {location.pathname}
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Button asChild><Link to="/"><Home className="w-4 h-4 ml-1" /> الرئيسية</Link></Button>
          <Button asChild variant="outline"><Link to="/cars"><Car className="w-4 h-4 ml-1" /> السيارات</Link></Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
