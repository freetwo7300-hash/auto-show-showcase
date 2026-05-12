import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/cars/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { useCars } from "@/hooks/useCars";
import { useInquiryStats } from "@/hooks/useInquiries";
import { useI18n } from "@/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Car, DollarSign, TrendingUp, Package,
  MessageSquare, Clock, CheckCircle2, XCircle, BarChart3,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "متاح": "#10b981",
  "محجوز": "#f59e0b",
  "مباع": "#e11d28",
};
const CONDITION_COLORS = ["#6366f1", "#94a3b8"];
const INQUIRY_COLORS = ["#3b82f6", "#10b981", "#6b7280"];

const tooltipStyle: React.CSSProperties = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  fontSize: "12px",
  color: "hsl(var(--card-foreground))",
};

function ChartCard({ title, children, col2 }: { title: string; children: React.ReactNode; col2?: boolean }) {
  return (
    <div className={`bg-card rounded-xl border p-5 ${col2 ? "lg:col-span-2" : ""}`}>
      <h3 className="font-display font-semibold text-sm text-foreground/75 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useI18n();
  const { isAdmin } = useAuth();

  const { data: cars = [], isLoading: carsLoading } = useCars();
  const { data: inquiryStats, isLoading: statsLoading } = useInquiryStats(isAdmin);

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4 text-muted-foreground">
          <BarChart3 className="w-14 h-14 opacity-20" />
          <p className="text-lg font-display font-semibold">{t.inquiryMgmt.adminOnly}</p>
        </div>
      </AppLayout>
    );
  }

  /* ── derive ── */
  const brandMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};
  const conditionMap: Record<string, number> = {};
  let totalValue = 0;

  for (const car of cars) {
    brandMap[car.brand] = (brandMap[car.brand] ?? 0) + 1;
    statusMap[car.status] = (statusMap[car.status] ?? 0) + 1;
    conditionMap[car.condition] = (conditionMap[car.condition] ?? 0) + 1;
    totalValue += Number(car.price);
  }

  const brandData = Object.entries(brandMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  const conditionData = Object.entries(conditionMap).map(([name, value]) => ({ name, value }));

  const topBrand = brandData[0]?.name ?? "—";
  const avgPrice = cars.length > 0 ? Math.round(totalValue / cars.length) : 0;
  const available = statusMap["متاح"] ?? 0;
  const reserved  = statusMap["محجوز"] ?? 0;
  const sold      = statusMap["مباع"]  ?? 0;

  const inquiryChartData = [
    { name: t.reports.newInquiries,        value: inquiryStats?.new       ?? 0, fill: "#3b82f6" },
    { name: t.reports.respondedInquiries,  value: inquiryStats?.responded ?? 0, fill: "#10b981" },
    { name: t.reports.closedInquiries,     value: inquiryStats?.closed    ?? 0, fill: "#6b7280" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-display font-bold">{t.reports.title}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t.reports.subtitle}</p>
        </div>

        {/* ── KPI row ── */}
        {carsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title={t.dashboard.totalCars}
              value={cars.length}
              icon={Car}
              trend={`${available} ${t.reports.totalAvailable}`}
            />
            <StatCard
              title={t.reports.inventoryValue}
              value={`${(totalValue / 1_000_000).toFixed(1)}M`}
              icon={DollarSign}
              trend={t.common.sar}
            />
            <StatCard
              title={t.reports.avgPrice}
              value={`${(avgPrice / 1000).toFixed(0)}K`}
              icon={TrendingUp}
              trend={t.car.sar}
            />
            <StatCard
              title={t.reports.topBrand}
              value={topBrand}
              icon={Package}
              trend={`${brandMap[topBrand] ?? 0} ${t.dashboard.totalCars}`}
            />
          </div>
        )}

        {/* ── Inventory status mini-row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t.reports.totalAvailable, value: available, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: t.reports.totalReserved,  value: reserved,  color: "text-amber-500",   bg: "bg-amber-500/10"   },
            { label: t.reports.totalSold,      value: sold,      color: "text-red-500",      bg: "bg-red-500/10"     },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl border p-4 flex items-center gap-3 bg-card`}>
              <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`font-display font-bold text-xl leading-tight ${item.color}`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title={t.reports.byBrand} col2>
            {carsLoading ? (
              <Skeleton className="h-52 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(180, brandData.length * 34)}>
                <BarChart data={brandData} layout="vertical" margin={{ right: 20, left: 8 }}>
                  <XAxis
                    type="number" allowDecimals={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    type="category" dataKey="name" width={80}
                    tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "سيارات"]} cursor={{ fill: "hsl(var(--muted)/0.5)" }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title={t.reports.byStatus}>
            {carsLoading ? (
              <Skeleton className="h-52 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData} dataKey="value" nameKey="name"
                    cx="50%" cy="44%" innerRadius={50} outerRadius={74}
                    paddingAngle={3} strokeWidth={0}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] ?? "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "سيارات"]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* ── Charts row 2: condition + inquiries ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title={t.reports.byCondition}>
            {carsLoading ? (
              <Skeleton className="h-48 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={conditionData} dataKey="value" nameKey="name"
                    cx="50%" cy="44%" innerRadius={44} outerRadius={68}
                    paddingAngle={4} strokeWidth={0}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {conditionData.map((_, i) => (
                      <Cell key={i} fill={CONDITION_COLORS[i % CONDITION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "سيارات"]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title={t.reports.inquiryStats} col2>
            {statsLoading ? (
              <Skeleton className="h-48 rounded-lg" />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t.reports.newInquiries,       value: inquiryStats?.new       ?? 0, icon: Clock,        color: "text-blue-500",    bg: "bg-blue-500/10"    },
                    { label: t.reports.respondedInquiries, value: inquiryStats?.responded ?? 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: t.reports.closedInquiries,    value: inquiryStats?.closed    ?? 0, icon: XCircle,      color: "text-muted-foreground", bg: "bg-muted"      },
                  ].map((item) => (
                    <div key={item.label} className="bg-background rounded-lg border p-3 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground leading-tight">{item.label}</p>
                        <p className={`font-display font-bold text-2xl leading-tight ${item.color}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={inquiryChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "استفسار"]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {inquiryChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        {/* ── Total inquiry count ── */}
        <div className="grid grid-cols-1">
          <StatCard
            title={t.nav.inquiries}
            value={inquiryStats?.total ?? 0}
            icon={MessageSquare}
            trend={`${inquiryStats?.new ?? 0} ${t.reports.newInquiries}`}
          />
        </div>
      </div>
    </AppLayout>
  );
}
