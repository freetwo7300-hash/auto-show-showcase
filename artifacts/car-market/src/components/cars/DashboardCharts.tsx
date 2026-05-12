import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useI18n } from "@/i18n";

interface CarLike {
  brand: string;
  price: number | string;
  condition: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  "متاح": "#10b981",
  "محجوز": "#f59e0b",
  "مباع": "#e11d28",
};

const CONDITION_COLORS = ["#6366f1", "#94a3b8"];

const tooltipStyle: React.CSSProperties = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  fontSize: "12px",
  color: "hsl(var(--card-foreground))",
  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display font-semibold text-sm text-foreground/75 mb-4">
      {children}
    </h3>
  );
}

export function DashboardCharts({ cars }: { cars: CarLike[] }) {
  const { t } = useI18n();
  if (cars.length === 0) return null;

  /* ── aggregate data ── */
  const brandMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};
  const conditionMap: Record<string, number> = {};

  for (const c of cars) {
    brandMap[c.brand] = (brandMap[c.brand] ?? 0) + 1;
    statusMap[c.status] = (statusMap[c.status] ?? 0) + 1;
    conditionMap[c.condition] = (conditionMap[c.condition] ?? 0) + 1;
  }

  const brandData = Object.entries(brandMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  const conditionData = Object.entries(conditionMap).map(([name, value]) => ({ name, value }));

  const prices = cars.map((c) => Number(c.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div className="space-y-4">
      {/* Row 1 — brand bar + status donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Horizontal bar: top brands */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-5">
          <SectionTitle>{t.dashboard.inventoryBreakdown}</SectionTitle>
          <ResponsiveContainer width="100%" height={Math.max(180, brandData.length * 34)}>
            <BarChart
              data={brandData}
              layout="vertical"
              margin={{ top: 0, right: 20, bottom: 0, left: 8 }}
            >
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                width={76}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [v, "سيارات"]}
                cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[0, 6, 6, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut: status */}
        <div className="bg-card rounded-xl border p-5">
          <SectionTitle>{t.reports.byStatus}</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={3}
                strokeWidth={0}
              >
                {statusData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={STATUS_COLORS[entry.name] ?? "hsl(var(--muted-foreground))"}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "سيارات"]} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 — condition cards + price range */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {conditionData.map((c, i) => (
          <div key={c.name} className="bg-card rounded-xl border p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: CONDITION_COLORS[i % CONDITION_COLORS.length] }}
            >
              {Math.round((c.value / cars.length) * 100)}%
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{c.name}</p>
              <p className="font-display font-bold text-xl leading-tight">{c.value}</p>
            </div>
          </div>
        ))}

        <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 shrink-0">
            <span className="text-emerald-500 text-[10px] font-bold">أدنى</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">أدنى سعر</p>
            <p className="font-display font-bold text-lg leading-tight">
              {(minPrice / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 shrink-0">
            <span className="text-primary text-[10px] font-bold">أعلى</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">أعلى سعر</p>
            <p className="font-display font-bold text-lg leading-tight">
              {(maxPrice / 1000).toFixed(0)}K
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
