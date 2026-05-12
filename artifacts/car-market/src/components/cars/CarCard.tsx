import { Link } from "wouter";
import { Car } from "@/data/cars";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Fuel, Gauge, Calendar, ArrowLeft, Heart, GitCompareArrows } from "lucide-react";
import placeholder from "@/assets/car-placeholder.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites, useToggleFavorite } from "@/hooks/useCars";
import { useCompare } from "@/hooks/useCompare";
import { useI18n } from "@/i18n";
import { toast } from "sonner";

interface CarCardProps {
  car: Car;
  delay?: number;
}

export function CarCard({ car, delay = 0 }: CarCardProps) {
  const { user } = useAuth();
  const { data: favs = [] } = useFavorites(user?.id);
  const toggle = useToggleFavorite(user?.id);
  const { toggle: compareToggle, isSelected, selectedCars } = useCompare();
  const { t } = useI18n();
  const isFav = favs.includes(car.id);
  const isCompared = isSelected(car.id);

  const statusColor = {
    "متاح": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    "محجوز": "bg-amber-500/10 text-amber-600 border-amber-200",
    "مباع": "bg-red-500/10 text-red-600 border-red-200",
  };

  const cover = car.images?.[0] || placeholder;

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("سجّل الدخول لإضافة المفضلة"); return; }
    toggle.mutate({ carId: car.id, isFav });
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCompared && selectedCars.length >= 3) {
      toast.info(t.compare.maxReached);
      return;
    }
    compareToggle(car);
  };

  return (
    /*
     * Outer div is the Tailwind `group` for group-hover utilities.
     * The full-card <Link> is placed absolutely inside (z-[1]).
     * Action buttons sit above the link at z-[2].
     * This avoids the invalid <button> inside <a> HTML error and
     * lets hover/focus work correctly on every element.
     */
    <div
      className="group relative opacity-0 animate-fade-in cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Full-card accessible link — absolute, covers the whole card */}
      <Link
        href={`/cars/${car.id}`}
        className={cn(
          "absolute inset-0 z-[1] rounded-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
        aria-label={`عرض تفاصيل ${car.brand} ${car.model}`}
      />

      {/* Card visual — group-hover drives all transitions */}
      <div className="relative bg-card rounded-xl border overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">

        {/* Image area */}
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={cover}
            alt={`${car.brand} ${car.model}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Status badge — top-right physically (start in RTL) */}
          <div className="absolute top-3 right-3 z-[3]">
            <Badge className={cn("text-xs border shadow-sm", statusColor[car.status])}>
              {car.status}
            </Badge>
          </div>

          {/* Bottom gradient scrim */}
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-card/90 to-transparent pointer-events-none" />
        </div>

        {/* Card body */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-base leading-tight truncate">
                {car.brand} {car.model}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{car.bodyType} • {car.color}</p>
            </div>
            <div className="text-end shrink-0 ms-2">
              <p className="font-display font-bold text-lg text-primary leading-tight">
                {car.price.toLocaleString("ar-SA")}
              </p>
              <p className="text-xs text-muted-foreground">{t.car.sar}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 shrink-0" />{car.year}
            </span>
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 shrink-0" />{car.mileage.toLocaleString("ar-SA")} {t.car.km}
            </span>
            <span className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 shrink-0" />{car.fuelType}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <Badge variant="secondary" className="text-xs">{car.condition}</Badge>
            <span className="flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {t.actions.view} <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons — z-[2], above the card link, semantically outside <a> */}
      <div className="absolute top-3 left-3 z-[2] flex gap-1.5">
        <button
          onClick={handleFav}
          className={cn(
            "w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm border border-white/10",
            "flex items-center justify-center transition-all duration-200",
            "hover:bg-background hover:scale-110 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          )}
          aria-label={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <Heart
            className={cn(
              "w-3.5 h-3.5 transition-colors",
              isFav ? "fill-red-500 text-red-500" : "text-muted-foreground",
            )}
          />
        </button>

        <button
          onClick={handleCompare}
          className={cn(
            "w-7 h-7 rounded-full backdrop-blur-sm border border-white/10",
            "flex items-center justify-center transition-all duration-200",
            "hover:scale-110 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isCompared
              ? "bg-primary border-primary hover:bg-primary/90"
              : "bg-background/80 hover:bg-background",
          )}
          aria-label={t.compare.selectToCompare}
        >
          <GitCompareArrows
            className={cn(
              "w-3.5 h-3.5 transition-colors",
              isCompared ? "text-primary-foreground" : "text-muted-foreground",
            )}
          />
        </button>
      </div>
    </div>
  );
}
