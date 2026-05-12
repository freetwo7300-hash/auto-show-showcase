import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCar, useDeleteCar } from "@/hooks/useCars";
import { useAuth } from "@/hooks/useAuth";
import { useCompare } from "@/hooks/useCompare";
import { useI18n } from "@/i18n";
import { carsData } from "@/data/cars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowRight, Calendar, Fuel, Gauge, Settings, Palette, Phone, MessageCircle, Car, Shield, CheckCircle2,
  Pencil, Trash2, GitCompareArrows,
} from "lucide-react";
import { CarGallery } from "@/components/cars/CarGallery";
import { InquiryDialog } from "@/components/InquiryDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Car as CarType } from "@/data/cars";

export default function CarDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isAdmin } = useAuth();
  const { toggle: compareToggle, isSelected } = useCompare();
  const { t } = useI18n();
  const { data: dbCar, isLoading } = useCar(id);
  const del = useDeleteCar();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const staticCar = carsData.find((c) => c.id === id);
  const car: (CarType & { added_by: string | null }) | null = dbCar
    ? {
        id: dbCar.id, brand: dbCar.brand, model: dbCar.model, year: dbCar.year,
        price: Number(dbCar.price), mileage: dbCar.mileage, condition: dbCar.condition as "جديد" | "مستعمل",
        color: dbCar.color, fuelType: "بنزين",
        transmission: "أوتوماتيك",
        engine: "—", bodyType: dbCar.body_type,
        description: dbCar.description || "", images: dbCar.images || [],
        features: dbCar.features || [], status: dbCar.status as "متاح" | "محجوز" | "مباع",
        added_by: dbCar.added_by,
      }
    : staticCar ? { ...staticCar, added_by: null as string | null } : null;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!car) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">السيارة غير موجودة</p>
          <Button variant="ghost" asChild className="mt-4"><Link href="/cars">{t.actions.back}</Link></Button>
        </div>
      </AppLayout>
    );
  }

  const isOwner = user && car.added_by === user.id;
  const canEdit = isOwner || isAdmin;

  const statusColor = {
    "متاح": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    "محجوز": "bg-amber-500/10 text-amber-600 border-amber-200",
    "مباع": "bg-red-500/10 text-red-600 border-red-200",
  };

  const specs = [
    { icon: Calendar, label: t.car.year, value: car.year },
    { icon: Gauge, label: t.car.mileage, value: `${car.mileage.toLocaleString("ar-SA")} ${t.car.km}` },
    { icon: Fuel, label: t.car.fuelType, value: car.fuelType },
    { icon: Settings, label: t.car.transmission, value: car.transmission },
    { icon: Car, label: t.car.engine, value: car.engine },
    { icon: Palette, label: t.car.color, value: car.color },
    { icon: Shield, label: t.car.condition, value: car.condition },
    { icon: Car, label: t.car.bodyType, value: car.bodyType },
  ];

  const handleDelete = async () => {
    try {
      await del.mutateAsync(car.id);
      toast.success("تم حذف السيارة");
      navigate("/cars");
    } catch (e) { toast.error(e instanceof Error ? e.message : "حدث خطأ"); }
  };

  const isCompared = isSelected(car.id);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cars" className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> {t.nav.cars}
            </Link>
          </Button>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={isCompared ? "default" : "outline"}
              onClick={() => compareToggle({ ...car })}
              className="gap-1.5"
            >
              <GitCompareArrows className="w-4 h-4" />
              {isCompared ? t.compare.selected : t.compare.selectToCompare}
            </Button>
            {canEdit && (
              <>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/cars/${car.id}/edit`}><Pencil className="w-4 h-4 ml-1" /> {t.actions.edit}</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4 ml-1" /> {t.actions.delete}</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.actions.confirmDelete}</AlertDialogTitle>
                      <AlertDialogDescription>{t.actions.deleteWarning}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>{t.actions.delete}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <CarGallery
          images={car.images}
          alt={`${car.brand} ${car.model}`}
          status={car.status}
          statusClass={cn("border", statusColor[car.status])}
        />

        <div className="absolute top-0 inset-x-0 pointer-events-none" aria-hidden>
          <div className="relative max-w-5xl mx-auto px-4 lg:px-6">
            <div className="absolute bottom-6 inset-x-6 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-2xl pointer-events-none">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{car.brand} {car.model}</h1>
              <p className="text-white/70 mt-1">{car.year} • {car.bodyType}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-display font-bold text-xl mb-1">{car.brand} {car.model}</h2>
              <p className="text-muted-foreground text-sm mb-5">{car.year} • {car.bodyType}</p>
              <h3 className="font-semibold mb-4">{t.compare.specs}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specs.map((s) => (
                  <div key={s.label} className="text-center p-3 rounded-lg bg-muted/50">
                    <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-bold mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            {car.description && (
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-display font-bold text-xl mb-3">{t.car.description}</h2>
                <p className="text-muted-foreground leading-relaxed">{car.description}</p>
              </div>
            )}
            {car.features.length > 0 && (
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-display font-bold text-xl mb-4">{t.car.features}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-xl border p-6 sticky top-20">
              <p className="text-sm text-muted-foreground mb-1">{t.car.price}</p>
              <p className="text-4xl font-display font-bold text-primary">{car.price.toLocaleString("ar-SA")}</p>
              <p className="text-muted-foreground text-sm">{t.common.sar}</p>
              <div className="space-y-3 mt-6">
                <Button className="w-full gap-2" size="lg" onClick={() => setInquiryOpen(true)}>
                  <MessageCircle className="w-4 h-4" /> {t.inquiry.title}
                </Button>
                <Button variant="outline" className="w-full gap-2" size="lg">
                  <Phone className="w-4 h-4" /> {t.inquiry.callNow}
                </Button>
              </div>
              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">📍 الرياض، المملكة العربية السعودية</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InquiryDialog
        carId={car.id}
        carName={`${car.brand} ${car.model}`}
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
      />
    </AppLayout>
  );
}
