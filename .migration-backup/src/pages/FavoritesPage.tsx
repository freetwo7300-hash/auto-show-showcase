import { AppLayout } from "@/components/layout/AppLayout";
import { CarCard } from "@/components/cars/CarCard";
import { useAuth } from "@/hooks/useAuth";
import { useCars, useFavorites } from "@/hooks/useCars";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { data: cars = [] } = useCars();
  const { data: favIds = [] } = useFavorites(user?.id);

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl mb-4">سجّل الدخول لعرض المفضلة</p>
          <Button asChild><Link to="/auth">تسجيل الدخول</Link></Button>
        </div>
      </AppLayout>
    );
  }

  const favCars = cars.filter((c) => favIds.includes(c.id)).map((c) => ({
    id: c.id, brand: c.brand, model: c.model, year: c.year, price: Number(c.price),
    mileage: c.mileage, condition: c.condition as any, color: c.color,
    fuelType: "بنزين", transmission: "أوتوماتيك", engine: "",
    bodyType: c.body_type, description: c.description || "",
    images: c.images || [], features: c.features || [], status: c.status as any,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" /> المفضلة
          </h1>
          <p className="text-muted-foreground mt-1">{favCars.length} سيارة محفوظة</p>
        </div>
        {favCars.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            لا توجد مفضلة بعد. تصفّح السيارات وأضف ما يعجبك.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favCars.map((c, i) => <CarCard key={c.id} car={c} delay={i * 80} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
