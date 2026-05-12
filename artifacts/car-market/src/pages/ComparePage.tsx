import { useCompare } from "@/hooks/useCompare";
import { useI18n } from "@/i18n";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { GitCompareArrows, ArrowRight, X } from "lucide-react";
import placeholder from "@/assets/car-placeholder.jpg";
import { cn } from "@/lib/utils";
import type { Car } from "@/data/cars";

const statusClass: Record<string, string> = {
  متاح: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  محجوز: "bg-amber-500/10 text-amber-600 border-amber-200",
  مباع: "bg-red-500/10 text-red-600 border-red-200",
};

function SpecRow({ label, values }: { label: string; values: (string | number | undefined)[] }) {
  const allSame = values.every((v) => v === values[0]);
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 px-4 text-sm font-medium text-muted-foreground bg-muted/30 whitespace-nowrap">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={cn(
            "py-3 px-4 text-sm text-center",
            !allSame && "font-semibold text-primary",
          )}
        >
          {v ?? "—"}
        </td>
      ))}
    </tr>
  );
}

function CarHeader({ car, onRemove }: { car: Car; onRemove: () => void }) {
  const { t } = useI18n();
  const cover = car.images?.[0] || placeholder;
  return (
    <th className="py-4 px-4 text-center">
      <div className="relative inline-block">
        <img src={cover} alt={`${car.brand} ${car.model}`} className="w-24 h-18 rounded-xl object-cover mx-auto mb-2" style={{ height: 72 }} />
        <button
          onClick={onRemove}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80"
          aria-label={t.actions.delete}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <Link href={`/cars/${car.id}`} className="block font-bold text-sm hover:text-primary transition-colors">
        {car.brand} {car.model}
      </Link>
      <p className="text-xs text-muted-foreground">{car.year}</p>
      <Badge className={cn("text-xs border mt-1", statusClass[car.status])}>{car.status}</Badge>
    </th>
  );
}

export default function ComparePage() {
  const { selectedCars, toggle, clear } = useCompare();
  const { t } = useI18n();

  const specs = (car: Car) => [
    { label: t.car.price, value: `${car.price.toLocaleString("ar-SA")} ${t.car.sar}` },
    { label: t.car.year, value: car.year },
    { label: t.car.mileage, value: `${car.mileage.toLocaleString()} ${t.car.km}` },
    { label: t.car.bodyType, value: car.bodyType },
    { label: t.car.color, value: car.color },
    { label: t.car.condition, value: car.condition },
    { label: t.car.fuelType, value: car.fuelType },
    { label: t.car.transmission, value: car.transmission },
    { label: t.car.engine, value: car.engine || "—" },
  ];

  const specKeys = selectedCars.length > 0 ? specs(selectedCars[0]).map((s) => s.label) : [];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <GitCompareArrows className="w-6 h-6 text-primary" />
              {t.compare.title}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t.compare.addHint}</p>
          </div>
          <div className="flex gap-2">
            {selectedCars.length > 0 && (
              <Button variant="outline" size="sm" onClick={clear}>
                <X className="w-4 h-4 ml-1" /> {t.compare.clear}
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cars"><ArrowRight className="w-4 h-4 ml-1" /> {t.actions.back}</Link>
            </Button>
          </div>
        </div>

        {selectedCars.length < 2 ? (
          <div className="text-center py-20 text-muted-foreground border rounded-2xl bg-card">
            <GitCompareArrows className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium mb-2">{t.compare.empty}</p>
            <p className="text-sm mb-6">{t.compare.addHint}</p>
            <Button asChild>
              <Link href="/cars">{t.nav.cars}</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-4 px-4 text-right w-36">
                      <span className="text-sm font-medium text-muted-foreground">{t.compare.specs}</span>
                    </th>
                    {selectedCars.map((car) => (
                      <CarHeader key={car.id} car={car} onRemove={() => toggle(car)} />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specKeys.map((label, si) => (
                    <SpecRow
                      key={label}
                      label={label}
                      values={selectedCars.map((car) => specs(car)[si]?.value)}
                    />
                  ))}
                  <tr className="border-t">
                    <td className="py-4 px-4 bg-muted/30" />
                    {selectedCars.map((car) => (
                      <td key={car.id} className="py-4 px-4 text-center">
                        <Button size="sm" asChild>
                          <Link href={`/cars/${car.id}`}>{t.actions.view}</Link>
                        </Button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
