import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

interface CarLike {
  brand: string;
  price: number | string;
  condition: string;
  status: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))"];

export function DashboardCharts({ cars }: { cars: CarLike[] }) {
  const byBrand = Object.entries(
    cars.reduce<Record<string, number>>((acc, c) => { acc[c.brand] = (acc[c.brand] || 0) + 1; return acc; }, {})
  ).map(([brand, count]) => ({ brand, count })).sort((a, b) => b.count - a.count).slice(0, 6);

  const byStatus = Object.entries(
    cars.reduce<Record<string, number>>((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const byCondition = Object.entries(
    cars.reduce<Record<string, number>>((acc, c) => { acc[c.condition] = (acc[c.condition] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-6 lg:col-span-2">
        <h3 className="font-display font-bold mb-4">السيارات حسب الماركة</h3>
        <ChartContainer config={{ count: { label: "العدد", color: "hsl(var(--primary))" } }} className="h-64 w-full">
          <BarChart data={byBrand}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="brand" className="text-xs" />
            <YAxis className="text-xs" allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-bold mb-4">حسب الحالة</h3>
        <ChartContainer config={{}} className="h-64 w-full">
          <PieChart>
            <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
              {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-3 justify-center text-xs mt-2">
          {byCondition.map((c, i) => (
            <span key={c.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              {c.name}: {c.value}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
