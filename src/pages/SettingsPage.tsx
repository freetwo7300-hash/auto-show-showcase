import { AppLayout } from "@/components/layout/AppLayout";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Moon, Sun, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const onSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج");
    navigate("/");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <SettingsIcon className="w-7 h-7" /> الإعدادات
        </h1>

        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">الوضع الليلي</Label>
              <p className="text-sm text-muted-foreground">بدّل بين الوضع الفاتح والداكن</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              <Moon className="w-4 h-4" />
            </div>
          </div>
        </div>

        {user && (
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <div>
              <h2 className="font-bold mb-1">الحساب</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="destructive" onClick={onSignOut}><LogOut className="w-4 h-4 ml-1" /> تسجيل الخروج</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
