import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCar } from "@/hooks/useCars";
import { carsData } from "@/data/cars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight, Calendar, Fuel, Gauge, Settings, Palette, Phone, MessageCircle, Car, Shield, CheckCircle2,
} from "lucide-react";

export default function CarDetailPage() {
  const { id } = useParams();
  const { data: dbCar, isLoading } = useCar(id);

  // Fallback to static data
  const staticCar = carsData.find((c) => c.id === id);

  const car = dbCar
    ? {
        id: dbCar.id,
        brand: dbCar.brand,
        model: dbCar.model,
        year: dbCar.year,
        price: Number(dbCar.price),
        mileage: dbCar.mileage,
        condition: dbCar.condition,
        color: dbCar.color,
        fuelType: (dbCar as any).fuel_type || "بنزين",
        transmission: (dbCar as any).transmission || "أوتوماتيك",
        engine: (dbCar as any).engine || "",
        bodyType: dbCar.body_type,
        description: dbCar.description || "",
        images: dbCar.images || [],
        features: dbCar.features || [],
        status: dbCar.status as "متاح" | "محجوز" | "مباع",
      }
    : staticCar;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-96 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!car) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">السيارة غير موجودة</p>
          <Button variant="ghost" asChild className="mt-4">
            <Link to="/cars">العودة للسيارات</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusColor = {
    "متاح": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    "محجوز": "bg-amber-500/10 text-amber-600 border-amber-200",
    "مباع": "bg-red-500/10 text-red-600 border-red-200",
  };

  const specs = [
    { icon: Calendar, label: "سنة الصنع", value: car.year },
    { icon: Gauge, label: "المسافة المقطوعة", value: `${car.mileage.toLocaleString("ar-SA")} كم` },
    { icon: Fuel, label: "نوع الوقود", value: car.fuelType },
    { icon: Settings, label: "ناقل الحركة", value: car.transmission },
    { icon: Car, label: "المحرك", value: car.engine },
    { icon: Palette, label: "اللون", value: car.color },
    { icon: Shield, label: "الحالة", value: car.condition },
    { icon: Car, label: "نوع الهيكل", value: car.bodyType },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/cars" className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            العودة للسيارات
          </Link>
        </Button>

        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-bl from-surface-dark to-muted h-64 md:h-96 animate-fade-in">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[120px] font-display font-bold text-muted-foreground/10">
              {car.brand.charAt(0)}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <Badge className={statusColor[car.status]}>{car.status}</Badge>
          </div>
          <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
              {car.brand} {car.model}
            </h1>
            <p className="text-white/70 mt-1">{car.year} • {car.bodyType}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <h2 className="font-display font-bold text-xl mb-4">المواصفات</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="text-center p-3 rounded-lg bg-muted/50">
                    <spec.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">{spec.label}</p>
                    <p className="text-sm font-bold mt-1">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <h2 className="font-display font-bold text-xl mb-3">الوصف</h2>
              <p className="text-muted-foreground leading-relaxed">{car.description}</p>
            </div>

            {car.features.length > 0 && (
              <div className="bg-card rounded-xl border p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
                <h2 className="font-display font-bold text-xl mb-4">المميزات</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-xl border p-6 sticky top-24 animate-fade-in" style={{ animationDelay: "150ms" }}>
              <p className="text-sm text-muted-foreground mb-1">السعر</p>
              <p className="text-4xl font-display font-bold text-primary">
                {car.price.toLocaleString("ar-SA")}
              </p>
              <p className="text-muted-foreground text-sm">ريال سعودي</p>
              <div className="space-y-3 mt-6">
                <Button className="w-full gap-2" size="lg">
                  <Phone className="w-4 h-4" />
                  اتصل الآن
                </Button>
                <Button variant="outline" className="w-full gap-2" size="lg">
                  <MessageCircle className="w-4 h-4" />
                  واتساب
                </Button>
              </div>
              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">📍 الرياض، المملكة العربية السعودية</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
