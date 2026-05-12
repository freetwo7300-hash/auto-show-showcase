import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CarCard } from "@/components/cars/CarCard";
import { CarFilters, Filters } from "@/components/cars/CarFilters";
import { useCars, type DbCar } from "@/hooks/useCars";
import { carsData, Car } from "@/data/cars";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const initialFilters: Filters = {
  search: "",
  brand: "",
  condition: "",
  bodyType: "",
  color: "",
  yearFrom: "",
  yearTo: "",
  priceFrom: "",
  priceTo: "",
};

const mapDbCar = (c: DbCar): Car => ({
  id: c.id,
  brand: c.brand,
  model: c.model,
  year: c.year,
  price: Number(c.price),
  mileage: c.mileage,
  condition: c.condition as "جديد" | "مستعمل",
  color: c.color,
  fuelType: "بنزين",
  transmission: "أوتوماتيك",
  engine: "",
  bodyType: c.body_type,
  description: c.description || "",
  images: c.images || [],
  features: c.features || [],
  status: c.status as "متاح" | "محجوز" | "مباع",
});

export default function CarsPage() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [view, setView] = useState<"grid" | "list">("grid");
  const { data: dbCars, isLoading } = useCars();

  const cars: Car[] = useMemo(() => {
    if (dbCars && dbCars.length > 0) return dbCars.map(mapDbCar);
    return carsData;
  }, [dbCars]);

  const filtered = useMemo(() => {
    return cars.filter((car) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!car.brand.toLowerCase().includes(q) && !car.model.toLowerCase().includes(q)) return false;
      }
      if (filters.brand && car.brand !== filters.brand) return false;
      if (filters.condition && car.condition !== filters.condition) return false;
      if (filters.bodyType && car.bodyType !== filters.bodyType) return false;
      if (filters.color && car.color !== filters.color) return false;
      return true;
    });
  }, [filters, cars]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">السيارات</h1>
            <p className="text-muted-foreground mt-1">
              تصفح جميع السيارات المتوفرة
              <Badge variant="secondary" className="mr-2">{filtered.length} سيارة</Badge>
            </p>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", view === "grid" && "bg-card shadow-sm")} onClick={() => setView("grid")}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", view === "list" && "bg-card shadow-sm")} onClick={() => setView("list")}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CarFilters filters={filters} onChange={setFilters} />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">لا توجد سيارات مطابقة</p>
            <Button variant="ghost" className="mt-2" onClick={() => setFilters(initialFilters)}>إعادة تعيين الفلاتر</Button>
          </div>
        ) : (
          <div className={cn("grid gap-4", view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
            {filtered.map((car, i) => <CarCard key={car.id} car={car} delay={i * 80} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
