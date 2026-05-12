import { AppLayout } from "@/components/layout/AppLayout";
import { useTheme } from "@/hooks/useTheme";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Moon, Sun, LogOut, Languages } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, signOut } = useAuth();
  const { t, lang, toggleLang } = useI18n();
  const [, navigate] = useLocation();

  const onSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج");
    navigate("/");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" /> {t.nav.settings}
        </h1>

        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">المظهر</h2>
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

        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">اللغة / Language</h2>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base flex items-center gap-2">
                <Languages className="w-4 h-4" />
                {lang === "ar" ? "اللغة العربية" : "English Language"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {lang === "ar" ? "التطبيق حالياً بالعربية" : "App is currently in English"}
              </p>
            </div>
            <Button variant="outline" onClick={toggleLang} className="gap-2">
              <Languages className="w-4 h-4" />
              {lang === "ar" ? "Switch to English" : "التبديل للعربية"}
            </Button>
          </div>
        </div>

        {user && (
          <div className="bg-card rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">الحساب</h2>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{user.display_name || user.email}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              {isAdmin && (
                <Badge className="bg-primary/10 text-primary border-primary/20 border">
                  {t.common.admin}
                </Badge>
              )}
            </div>
            <Button variant="destructive" onClick={onSignOut} className="gap-2">
              <LogOut className="w-4 h-4" /> {t.nav.signOut}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
