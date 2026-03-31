import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/cars/StatCard";
import { CarCard } from "@/components/cars/CarCard";
import { carsData } from "@/data/cars";
import { Car, DollarSign, TrendingUp, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const totalCars = carsData.length;
  const available = carsData.filter((c) => c.status === "متاح").length;
  const newCars = carsData.filter((c) => c.condition === "جديد").length;
  const totalValue = carsData.reduce((sum, c) => sum + c.price, 0);

  const recentCars = carsData.slice(0, 4);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على معرض السيارات</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي السيارات"
            value={totalCars}
            icon={Car}
            trend={`${available} متاحة`}
            delay={0}
          />
          <StatCard
            title="سيارات جديدة"
            value={newCars}
            icon={Package}
            trend="زيرو كيلومتر"
            delay={100}
          />
          <StatCard
            title="إجمالي القيمة"
            value={`${(totalValue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            trend="ريال سعودي"
            delay={200}
          />
          <StatCard
            title="متوسط السعر"
            value={`${Math.round(totalValue / totalCars / 1000)}K`}
            icon={TrendingUp}
            trend="ريال"
            delay={300}
          />
        </div>

        {/* Recent cars */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold">أحدث السيارات</h2>
            <Button variant="ghost" asChild>
              <Link to="/cars">عرض الكل</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentCars.map((car, i) => (
              <CarCard key={car.id} car={car} delay={i * 100} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
