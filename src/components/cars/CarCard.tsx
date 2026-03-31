import { Link } from "react-router-dom";
import { Car } from "@/data/cars";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Fuel, Gauge, Calendar, ArrowLeft } from "lucide-react";

interface CarCardProps {
  car: Car;
  delay?: number;
}

export function CarCard({ car, delay = 0 }: CarCardProps) {
  const statusColor = {
    "متاح": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    "محجوز": "bg-amber-500/10 text-amber-600 border-amber-200",
    "مباع": "bg-red-500/10 text-red-600 border-red-200",
  };

  return (
    <Link
      to={`/cars/${car.id}`}
      className="group block opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="bg-card rounded-xl border overflow-hidden card-hover">
        {/* Image placeholder */}
        <div className="relative h-48 bg-gradient-to-bl from-muted to-accent overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-display font-bold text-muted-foreground/20">
              {car.brand.charAt(0)}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <Badge className={cn("text-xs border", statusColor[car.status])}>
              {car.status}
            </Badge>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-card to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-display font-bold text-lg">{car.brand} {car.model}</h3>
              <p className="text-sm text-muted-foreground">{car.bodyType} • {car.color}</p>
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-xl text-primary">
                {car.price.toLocaleString("ar-SA")}
              </p>
              <p className="text-xs text-muted-foreground">ريال</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {car.year}
            </span>
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              {car.mileage.toLocaleString("ar-SA")} كم
            </span>
            <span className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5" />
              {car.fuelType}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <Badge variant="secondary" className="text-xs">
              {car.condition}
            </Badge>
            <span className="flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              التفاصيل
              <ArrowLeft className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
