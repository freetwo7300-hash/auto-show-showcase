import { useCompare } from "@/hooks/useCompare";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { X, GitCompareArrows } from "lucide-react";
import placeholder from "@/assets/car-placeholder.jpg";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const { selectedCars, clear, toggle } = useCompare();
  const { t } = useI18n();

  if (selectedCars.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="mx-auto max-w-4xl m-3">
        <div className="bg-card border shadow-2xl rounded-2xl p-3 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GitCompareArrows className="w-5 h-5 text-primary flex-none" />
            <span className="text-sm font-medium hidden sm:block">{t.compare.title}:</span>
            <div className="flex gap-2 overflow-x-auto">
              {selectedCars.map((car) => (
                <div key={car.id} className="relative flex-none group">
                  <img
                    src={car.images?.[0] || placeholder}
                    alt={`${car.brand} ${car.model}`}
                    className="w-10 h-8 rounded-lg object-cover ring-2 ring-primary"
                  />
                  <button
                    onClick={() => toggle(car)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                  <p className="text-[10px] text-muted-foreground text-center mt-0.5 max-w-[40px] truncate">
                    {car.brand}
                  </p>
                </div>
              ))}
              {Array.from({ length: 3 - selectedCars.length }).map((_, i) => (
                <div key={`empty-${i}`}
                  className="flex-none w-10 h-8 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-muted-foreground/40 text-lg leading-none">+</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-none">
            <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground h-8 px-2">
              <X className="w-4 h-4" />
              <span className="hidden sm:inline ms-1">{t.compare.clear}</span>
            </Button>
            <Button size="sm" asChild className={cn("h-8", selectedCars.length < 2 && "opacity-50 pointer-events-none")}>
              <Link href="/compare">
                {t.compare.compareNow} ({selectedCars.length}/3)
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
