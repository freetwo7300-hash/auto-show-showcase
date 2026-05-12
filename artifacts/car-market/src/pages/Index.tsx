import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/cars/StatCard";
import { CarCard } from "@/components/cars/CarCard";
import { DashboardCharts } from "@/components/cars/DashboardCharts";
import { useCars, type DbCar } from "@/hooks/useCars";
import { carsData, type Car } from "@/data/cars";
import { Car as CarIcon, DollarSign, TrendingUp, Package, Sparkles, PlusCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";
import hero from "@/assets/hero-showroom.jpg";

function mapDbCar(c: DbCar): Car {
  return {
    id: c.id, brand: c.brand, model: c.model, year: c.year,
    price: Number(c.price), mileage: c.mileage,
    condition: c.condition as "جديد" | "مستعمل",
    color: c.color, fuelType: "بنزين", transmission: "أوتوماتيك", engine: "",
    bodyType: c.body_type, description: c.description || "",
    images: c.images || [], features: c.features || [],
    status: c.status as "متاح" | "محجوز" | "مباع",
  };
}

const Dashboard = () => {
  const { t } = useI18n();
  const { data: dbCars, isLoading } = useCars();
  const hasDbData = dbCars && dbCars.length > 0;

  const cars: Car[] = hasDbData ? dbCars.map(mapDbCar) : carsData;
  const totalCars = cars.length;
  const available = cars.filter((c) => c.status === "متاح").length;
  const newCars = cars.filter((c) => c.condition === "جديد").length;
  const totalValue = cars.reduce((s, c) => s + Number(c.price), 0);
  const recentCars = cars.slice(0, 4);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="relative rounded-3xl overflow-hidden border">
          <img src={hero} alt="معرض سيارات فاخر" width={1920} height={896}
            className="w-full h-56 md:h-72 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary mb-3">
              <Sparkles className="w-4 h-4" /> {t.dashboard.welcome}
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-3">
              {t.dashboard.title}
            </h1>
            <p className="text-muted-foreground mb-5 max-w-md">
              {t.dashboard.subtitle}
            </p>
            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link href="/cars/new"><PlusCircle className="w-4 h-4 ml-1" /> {t.dashboard.addCar}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/cars">{t.dashboard.browseCars}</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t.dashboard.totalCars} value={totalCars} icon={CarIcon} trend={`${available} ${t.dashboard.available}`} delay={0} />
          <StatCard title={t.dashboard.newCars} value={newCars} icon={Package} trend={t.dashboard.zeroKm} delay={100} />
          <StatCard title={t.dashboard.totalValue} value={`${(totalValue / 1000000).toFixed(1)}M`} icon={DollarSign} trend={t.common.sar} delay={200} />
          <StatCard title={t.dashboard.avgPrice} value={totalCars > 0 ? `${Math.round(totalValue / totalCars / 1000)}K` : "0"} icon={TrendingUp} trend={t.car.sar} delay={300} />
        </div>

        <DashboardCharts cars={cars} />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold">{t.dashboard.latestCars}</h2>
            <Button variant="ghost" asChild><Link href="/cars">{t.dashboard.viewAll}</Link></Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentCars.map((car, i) => (
                <CarCard key={car.id} car={car} delay={i * 100} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
