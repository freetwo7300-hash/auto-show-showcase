import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRANDS, COLORS, BODY_TYPES } from "@/data/cars";
import { useCar, useUpdateCar } from "@/hooks/useCars";
import { useAuth } from "@/hooks/useAuth";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";

export default function EditCarPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: car, isLoading } = useCar(id);
  const update = useUpdateCar();
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    brand: "", model: "", year: "", price: "", mileage: "0",
    bodyType: "", color: "", condition: "", status: "متاح", description: "",
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (car) {
      setForm({
        brand: car.brand, model: car.model, year: String(car.year),
        price: String(car.price), mileage: String(car.mileage),
        bodyType: car.body_type, color: car.color, condition: car.condition,
        status: car.status, description: car.description || "",
      });
      setImages(car.images || []);
    }
  }, [car]);

  if (!user) return <AppLayout><div className="text-center py-20"><p>سجّل الدخول أولاً</p><Button className="mt-4" onClick={() => navigate("/sign-in")}>تسجيل الدخول</Button></div></AppLayout>;
  if (isLoading) return <AppLayout><div className="p-8">جاري التحميل...</div></AppLayout>;
  if (!car) return <AppLayout><div className="p-8">السيارة غير موجودة</div></AppLayout>;
  if (car.added_by !== user.id) return <AppLayout><div className="p-8">لا تملك صلاحية التعديل</div></AppLayout>;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        id: car.id,
        brand: form.brand, model: form.model, year: parseInt(form.year),
        price: parseFloat(form.price), mileage: parseInt(form.mileage) || 0,
        body_type: form.bodyType, color: form.color, condition: form.condition,
        status: form.status, description: form.description || null,
        images: images.length > 0 ? images : null,
      });
      toast.success("تم تحديث السيارة");
      navigate(`/cars/${car.id}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "حدث خطأ"); }
  };

  const set = (k: keyof typeof form) => (v: string) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold">تعديل السيارة</h1>
        <form onSubmit={onSubmit} className="bg-card rounded-xl border p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>الماركة</Label>
              <Select value={form.brand} onValueChange={set("brand")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>الموديل</Label>
              <Input value={form.model} onChange={(e) => set("model")(e.target.value)} /></div>
            <div className="space-y-2"><Label>السنة</Label>
              <Input type="number" value={form.year} onChange={(e) => set("year")(e.target.value)} /></div>
            <div className="space-y-2"><Label>السعر</Label>
              <Input type="number" value={form.price} onChange={(e) => set("price")(e.target.value)} /></div>
            <div className="space-y-2"><Label>المسافة</Label>
              <Input type="number" value={form.mileage} onChange={(e) => set("mileage")(e.target.value)} /></div>
            <div className="space-y-2"><Label>نوع الهيكل</Label>
              <Select value={form.bodyType} onValueChange={set("bodyType")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BODY_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>اللون</Label>
              <Select value={form.color} onValueChange={set("color")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>الحالة</Label>
              <Select value={form.condition} onValueChange={set("condition")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="جديد">جديد</SelectItem><SelectItem value="مستعمل">مستعمل</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>الوضع</Label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="متاح">متاح</SelectItem>
                  <SelectItem value="محجوز">محجوز</SelectItem>
                  <SelectItem value="مباع">مباع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>الوصف</Label>
            <Textarea rows={4} value={form.description} onChange={(e) => set("description")(e.target.value)} /></div>
          <div className="space-y-2"><Label>الصور</Label>
            <ImageUpload images={images} onChange={setImages} maxImages={10} /></div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" size="lg" disabled={update.isPending}>{update.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate(`/cars/${car.id}`)}>إلغاء</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
