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
    if (!user) { toast.error("سجّل الدخول لإضافة المفضلة"); return; }
    toggle.mutate({ carId: car.id, isFav });
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCompared && selectedCars.length >= 3) {
      toast.info(t.compare.maxReached);
      return;
    }
    compareToggle(car);
  };

  return (
    <Link
      href={`/cars/${car.id}`}
      className="group block opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="bg-card rounded-xl border overflow-hidden card-hover">
        <div className="relative h-48 overflow-hidden bg-muted">
          <img src={cover} alt={`${car.brand} ${car.model}`} loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute top-3 right-3">
            <Badge className={cn("text-xs border", statusColor[car.status])}>{car.status}</Badge>
          </div>
          <div className="absolute top-3 left-3 flex gap-1.5">
            <button
              onClick={handleFav}
              className="w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
              aria-label="مفضلة"
            >
              <Heart className={cn("w-3.5 h-3.5", isFav ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
            </button>
            <button
              onClick={handleCompare}
              className={cn(
                "w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors",
                isCompared && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              aria-label={t.compare.selectToCompare}
            >
              <GitCompareArrows className={cn("w-3.5 h-3.5", isCompared ? "text-primary-foreground" : "text-muted-foreground")} />
            </button>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-card to-transparent" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-display font-bold text-base leading-tight">{car.brand} {car.model}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{car.bodyType} • {car.color}</p>
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-lg text-primary leading-tight">
                {car.price.toLocaleString("ar-SA")}
              </p>
              <p className="text-xs text-muted-foreground">{t.car.sar}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{car.year}</span>
            <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />{car.mileage.toLocaleString("ar-SA")} {t.car.km}</span>
            <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />{car.fuelType}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <Badge variant="secondary" className="text-xs">{car.condition}</Badge>
            <span className="flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {t.actions.view} <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
