import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { Car as CarIcon, CheckCircle } from "lucide-react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { I18nProvider } from "@/i18n";
import { CompareProvider } from "@/hooks/useCompare";
import Index from "./pages/Index";
import CarsPage from "./pages/CarsPage";
import CarDetailPage from "./pages/CarDetailPage";
import AddCarPage from "./pages/AddCarPage";
import EditCarPage from "./pages/EditCarPage";
import ComparePage from "./pages/ComparePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import InquiriesPage from "./pages/InquiriesPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#e11d48",
    colorForeground: "#f8fafc",
    colorMutedForeground: "#94a3b8",
    colorDanger: "#ef4444",
    colorBackground: "#1e1e2e",
    colorInput: "#2d2d3f",
    colorInputForeground: "#f8fafc",
    colorNeutral: "#334155",
    fontFamily: "Cairo, Tajawal, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#1e1e2e] rounded-2xl w-[440px] max-w-full overflow-hidden border border-white/10",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-bold",
    headerSubtitle: "text-slate-400",
    socialButtonsBlockButtonText: "text-white",
    formFieldLabel: "text-slate-300",
    footerActionLink: "text-rose-400 hover:text-rose-300",
    footerActionText: "text-slate-400",
    dividerText: "text-slate-500",
    identityPreviewEditButton: "text-rose-400",
    formFieldSuccessText: "text-emerald-400",
    alertText: "text-white",
    logoBox: "flex justify-center",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border-white/10 hover:bg-white/5",
    formButtonPrimary: "bg-rose-600 hover:bg-rose-700 text-white",
    formFieldInput: "bg-[#2d2d3f] border-white/10 text-white",
    footerAction: "bg-transparent",
    dividerLine: "bg-white/10",
    alert: "bg-red-900/30 border-red-500/30",
    otpCodeFieldInput: "bg-[#2d2d3f] border-white/10 text-white",
    formFieldRow: "gap-3",
    main: "gap-4",
  },
};

const authFeatures = [
  { text: "تصفح مئات السيارات الفاخرة بتصاميم أنيقة" },
  { text: "قارن بين السيارات لاتخاذ أفضل قرار" },
  { text: "احفظ مفضلاتك وتواصل مع المعرض مباشرة" },
];

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-[100dvh] flex"
      style={{ background: "hsl(0 0% 6%)" }}
    >
      {/* ── Left / branding panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col items-center justify-center p-14 overflow-hidden select-none">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 30% 50%, hsl(0 85% 50% / 0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "hsl(0 85% 50% / 0.06)" }}
        />
        <div
          className="absolute -top-24 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "hsl(0 85% 50% / 0.04)" }}
        />

        <div className="relative z-10 w-full max-w-md text-right">
          <div className="flex items-center gap-4 mb-12">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40 shrink-0"
              style={{ background: "hsl(0 85% 50%)" }}
            >
              <CarIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white leading-tight">المعرض</h1>
              <p className="text-sm" style={{ color: "hsl(0 0% 55%)" }}>إدارة السيارات الفاخرة</p>
            </div>
          </div>

          <h2
            className="font-display text-4xl xl:text-5xl font-bold leading-tight mb-5"
            style={{ color: "hsl(0 0% 94%)" }}
          >
            اكتشف سيارتك
            <br />
            <span style={{ color: "hsl(0 85% 55%)" }}>المثالية</span> بسهولة
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: "hsl(0 0% 50%)" }}>
            منصة متكاملة لعرض وإدارة السيارات بواجهة عربية أنيقة
          </p>

          <ul className="space-y-4">
            {authFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: "hsl(0 85% 55%)" }} />
                <span className="text-sm" style={{ color: "hsl(0 0% 65%)" }}>{f.text}</span>
              </li>
            ))}
          </ul>

          <div
            className="mt-14 pt-8 border-t flex items-center justify-between text-xs"
            style={{ borderColor: "hsl(0 0% 18%)", color: "hsl(0 0% 35%)" }}
          >
            <span>© 2026 المعرض</span>
            <span>جميع الحقوق محفوظة</span>
          </div>
        </div>
      </div>

      {/* ── Right / Clerk form panel ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-4 py-12 relative"
        style={{ borderRight: "1px solid hsl(0 0% 13%)" }}
      >
        <div
          className="absolute top-0 inset-x-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, hsl(0 85% 50% / 0.4), transparent)" }}
        />
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: "hsl(0 85% 50%)" }}
          >
            <CarIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-white">المعرض</span>
        </div>
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthLayout>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthLayout>
  );
}

function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthLayout>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/"              component={Index}         />
      <Route path="/cars"          component={CarsPage}      />
      <Route path="/cars/new"      component={AddCarPage}    />
      <Route path="/cars/:id/edit" component={EditCarPage}   />
      <Route path="/cars/:id"      component={CarDetailPage} />
      <Route path="/compare"       component={ComparePage}   />
      <Route path="/profile"       component={ProfilePage}   />
      <Route path="/settings"      component={SettingsPage}  />
      <Route path="/inquiries"     component={InquiriesPage} />
      <Route path="/reports"       component={ReportsPage}   />
      <Route path="/sign-in/*?"    component={SignInPage}    />
      <Route path="/sign-up/*?"    component={SignUpPage}    />
      <Route                       component={NotFound}      />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn:  { start: { title: "أهلاً بعودتك",      subtitle: "سجّل دخولك للمتابعة"     } },
        signUp:  { start: { title: "إنشاء حساب جديد",   subtitle: "سجّل في معرض السيارات"   } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ThemeProvider>
          <I18nProvider>
            <CompareProvider>
              <TooltipProvider>
                <Sonner />
                <AppRoutes />
              </TooltipProvider>
            </CompareProvider>
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
