import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Car, PlusCircle, Menu, X, LogIn, LogOut,
  Sun, Moon, Heart, User, Settings, GitCompareArrows, Languages,
  MessageSquare, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useI18n } from "@/i18n";
import { useFavorites } from "@/hooks/useCars";
import { useInquiryStats } from "@/hooks/useInquiries";
import { useCompare } from "@/hooks/useCompare";
import { FavoritesDrawer } from "@/components/FavoritesDrawer";
import { CompareBar } from "@/components/CompareBar";
import { toast } from "sonner";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favDrawerOpen, setFavDrawerOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, isAdmin, signOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLang, lang } = useI18n();
  const { data: favIds = [] } = useFavorites(user?.id);
  const { selectedCars } = useCompare();
  const { data: inquiryStats } = useInquiryStats(isAdmin);

  const newInquiries = inquiryStats?.new ?? 0;

  const mainNav = [
    { href: "/",         label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/cars",     label: t.nav.cars,       icon: Car             },
    { href: "/cars/new", label: t.nav.addCar,     icon: PlusCircle      },
    { href: "/compare",  label: t.nav.compare,    icon: GitCompareArrows },
    { href: "/profile",  label: t.nav.profile,    icon: User            },
    { href: "/settings", label: t.nav.settings,   icon: Settings        },
  ];

  const adminNav = [
    { href: "/inquiries", label: t.nav.inquiries, icon: MessageSquare, badge: newInquiries },
    { href: "/reports",   label: t.nav.reports,   icon: BarChart3,     badge: 0           },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج");
    navigate("/");
  };

  function NavLink({
    href, label, icon: Icon, badge = 0, extraBadge,
  }: {
    href: string; label: string; icon: React.ElementType; badge?: number; extraBadge?: React.ReactNode;
  }) {
    const isActive = location === href || (href !== "/" && location.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon className="w-4 h-4 flex-none" />
        <span className="flex-1 truncate">{label}</span>
        {badge > 0 && (
          <Badge className={cn(
            "text-[10px] px-1.5 py-0 h-4 min-w-[18px] flex items-center justify-center",
            isActive ? "bg-white/20 text-white border-0" : "bg-primary/15 text-primary border-0",
          )}>
            {badge > 99 ? "99+" : badge}
          </Badge>
        )}
        {extraBadge}
      </Link>
    );
  }

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 right-0 z-50 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Car className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-base font-bold text-sidebar-primary-foreground">
                  المعرض
                </h1>
                <p className="text-[11px] text-sidebar-foreground/60">إدارة السيارات</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {mainNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              extraBadge={
                item.href === "/compare" && selectedCars.length > 0 ? (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">
                    {selectedCars.length}
                  </Badge>
                ) : undefined
              }
            />
          ))}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="flex items-center gap-2 pt-3 pb-1 px-3">
                <div className="flex-1 h-px bg-sidebar-border" />
                <span className="text-[10px] font-semibold text-sidebar-foreground/35 uppercase tracking-widest shrink-0">
                  {t.common.admin}
                </span>
                <div className="flex-1 h-px bg-sidebar-border" />
              </div>
              {adminNav.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                />
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-sidebar-border">
          {!loading && (user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-bold text-sidebar-accent-foreground flex-none">
                  {user.email?.charAt(0).toUpperCase() || "م"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-sidebar-primary-foreground truncate">
                    {user.email}
                  </p>
                  <p className="text-[10px] text-sidebar-foreground/50">
                    {isAdmin ? t.common.admin : "مسجّل"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-red-400 transition-colors w-full rounded-lg hover:bg-sidebar-accent"
              >
                <LogOut className="w-4 h-4" />
                {t.nav.signOut}
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
            >
              <LogIn className="w-4 h-4" />
              {t.nav.signIn}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen flex flex-col overflow-hidden">
        <header className="sticky top-0 z-30 glass border-b px-4 lg:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-accent flex-none"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon" className="h-8 w-8 text-xs font-bold"
              onClick={toggleLang}
              title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
            >
              <Languages className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost" size="icon" className="h-8 w-8 relative"
              onClick={() => setFavDrawerOpen(true)}
              aria-label={t.favorites.title}
            >
              <Heart className="w-4 h-4" />
              {favIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {favIds.length > 9 ? "9+" : favIds.length}
                </span>
              )}
            </Button>

            <Button
              variant="ghost" size="icon" className="h-8 w-8 relative"
              asChild aria-label={t.nav.compare}
            >
              <Link href="/compare">
                <GitCompareArrows className="w-4 h-4" />
                {selectedCars.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                    {selectedCars.length}
                  </span>
                )}
              </Link>
            </Button>

            {/* Admin quick-link to inquiries in header */}
            {isAdmin && newInquiries > 0 && (
              <Button
                variant="ghost" size="icon" className="h-8 w-8 relative"
                asChild aria-label={t.nav.inquiries}
              >
                <Link href="/inquiries">
                  <MessageSquare className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {newInquiries > 9 ? "9+" : newInquiries}
                  </span>
                </Link>
              </Button>
            )}

            <Button
              variant="ghost" size="icon" className="h-8 w-8"
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 pb-20">{children}</div>
      </main>

      <FavoritesDrawer open={favDrawerOpen} onClose={() => setFavDrawerOpen(false)} />
      <CompareBar />
    </div>
  );
}
