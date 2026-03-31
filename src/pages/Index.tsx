import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/cars/StatCard";
import { CarCard } from "@/components/cars/CarCard";
import { useCars } from "@/hooks/useCars";
import { carsData } from "@/data/cars";
import { Car, DollarSign, TrendingUp, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: dbCars, isLoading } = useCars();

  // Merge DB cars with static fallback
  const allCars = dbCars && dbCars.length > 0 ? dbCars : null;

  const totalCars = allCars ? allCars.length : carsData.length;
  const available = allCars
    ? allCars.filter((c) => c.status === "متاح").length
    : carsData.filter((c) => c.status === "متاح").length;
  const newCars = allCars
    ? allCars.filter((c) => c.condition === "جديد").length
    : carsData.filter((c) => c.condition === "جديد").length;
  const totalValue = allCars
    ? allCars.reduce((sum, c) => sum + Number(c.price), 0)
    : carsData.reduce((sum, c) => sum + c.price, 0);

  const recentCars = allCars ? allCars.slice(0, 4) : carsData.slice(0, 4);

  // Map DB car to display format
  const mapDbCar = (c: any) => ({
    id: c.id,
    brand: c.brand,
    model: c.model,
    year: c.year,
    price: Number(c.price),
    mileage: c.mileage,
    condition: c.condition as "جديد" | "مستعمل",
    color: c.color,
    fuelType: c.fuel_type || "بنزين",
    transmission: c.transmission || "أوتوماتيك",
    engine: c.engine || "",
    bodyType: c.body_type,
    description: c.description || "",
    images: c.images || [],
    features: c.features || [],
    status: c.status as "متاح" | "محجوز" | "مباع",
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على معرض السيارات</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="إجمالي السيارات" value={totalCars} icon={Car} trend={`${available} متاحة`} delay={0} />
          <StatCard title="سيارات جديدة" value={newCars} icon={Package} trend="زيرو كيلومتر" delay={100} />
          <StatCard title="إجمالي القيمة" value={`${(totalValue / 1000000).toFixed(1)}M`} icon={DollarSign} trend="ريال سعودي" delay={200} />
          <StatCard title="متوسط السعر" value={totalCars > 0 ? `${Math.round(totalValue / totalCars / 1000)}K` : "0"} icon={TrendingUp} trend="ريال" delay={300} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold">أحدث السيارات</h2>
            <Button variant="ghost" asChild>
              <Link to="/cars">عرض الكل</Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentCars.map((car, i) => (
                <CarCard key={car.id} car={allCars ? mapDbCar(car) : car} delay={i * 100} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
