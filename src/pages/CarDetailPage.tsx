import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCar, useDeleteCar } from "@/hooks/useCars";
import { useAuth } from "@/hooks/useAuth";
import { carsData } from "@/data/cars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ArrowRight, Calendar, Fuel, Gauge, Settings, Palette, Phone, MessageCircle, Car, Shield, CheckCircle2,
  Pencil, Trash2,
} from "lucide-react";
import placeholder from "@/assets/car-placeholder.jpg";
import { toast } from "sonner";

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dbCar, isLoading } = useCar(id);
  const del = useDeleteCar();
  const [lightbox, setLightbox] = useState<string | null>(null);

  const staticCar = carsData.find((c) => c.id === id);
  const car = dbCar
    ? {
        id: dbCar.id, brand: dbCar.brand, model: dbCar.model, year: dbCar.year,
        price: Number(dbCar.price), mileage: dbCar.mileage, condition: dbCar.condition,
        color: dbCar.color, fuelType: (dbCar as any).fuel_type || "بنزين",
        transmission: (dbCar as any).transmission || "أوتوماتيك",
        engine: (dbCar as any).engine || "—", bodyType: dbCar.body_type,
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
          <Button variant="ghost" asChild className="mt-4"><Link to="/cars">العودة للسيارات</Link></Button>
        </div>
      </AppLayout>
    );
  }

  const isOwner = user && (car as any).added_by === user.id;
  const images = car.images && car.images.length > 0 ? car.images : [placeholder];

  const statusColor = {
    "متاح": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    "محجوز": "bg-amber-500/10 text-amber-600 border-amber-200",
    "مباع": "bg-red-500/10 text-red-600 border-red-200",
  };

  const specs = [
    { icon: Calendar, label: "سنة الصنع", value: car.year },
    { icon: Gauge, label: "المسافة", value: `${car.mileage.toLocaleString("ar-SA")} كم` },
    { icon: Fuel, label: "الوقود", value: car.fuelType },
    { icon: Settings, label: "ناقل الحركة", value: car.transmission },
    { icon: Car, label: "المحرك", value: car.engine },
    { icon: Palette, label: "اللون", value: car.color },
    { icon: Shield, label: "الحالة", value: car.condition },
    { icon: Car, label: "نوع الهيكل", value: car.bodyType },
  ];

  const handleDelete = async () => {
    try {
      await del.mutateAsync(car.id);
      toast.success("تم حذف السيارة");
      navigate("/cars");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/cars" className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> العودة للسيارات
            </Link>
          </Button>
          {isOwner && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link to={`/cars/${car.id}/edit`}><Pencil className="w-4 h-4 ml-1" /> تعديل</Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4 ml-1" /> حذف</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                    <AlertDialogDescription>سيتم حذف هذه السيارة نهائياً. هل أنت متأكد؟</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Gallery */}
        <div className="space-y-3 animate-fade-in">
          <div className="relative rounded-2xl overflow-hidden bg-muted h-64 md:h-[28rem] cursor-zoom-in"
               onClick={() => setLightbox(images[0])}>
            <img src={images[0]} alt={`${car.brand} ${car.model}`}
                 className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4">
              <Badge className={statusColor[car.status]}>{car.status}</Badge>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{car.brand} {car.model}</h1>
              <p className="text-white/70 mt-1">{car.year} • {car.bodyType}</p>
            </div>
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {images.slice(1).map((img, i) => (
                <button key={i} onClick={() => setLightbox(img)}
                        className="relative aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity">
                  <img src={img} alt={`${car.brand} ${i + 2}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
          <DialogContent className="max-w-4xl p-2">
            {lightbox && <img src={lightbox} alt="" className="w-full h-auto rounded-lg" />}
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-display font-bold text-xl mb-4">المواصفات</h2>
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
                <h2 className="font-display font-bold text-xl mb-3">الوصف</h2>
                <p className="text-muted-foreground leading-relaxed">{car.description}</p>
              </div>
            )}
            {car.features.length > 0 && (
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-display font-bold text-xl mb-4">المميزات</h2>
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
            <div className="bg-card rounded-xl border p-6 sticky top-24">
              <p className="text-sm text-muted-foreground mb-1">السعر</p>
              <p className="text-4xl font-display font-bold text-primary">{car.price.toLocaleString("ar-SA")}</p>
              <p className="text-muted-foreground text-sm">ريال سعودي</p>
              <div className="space-y-3 mt-6">
                <Button className="w-full gap-2" size="lg"><Phone className="w-4 h-4" /> اتصل الآن</Button>
                <Button variant="outline" className="w-full gap-2" size="lg"><MessageCircle className="w-4 h-4" /> واتساب</Button>
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
