import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRANDS, COLORS, BODY_TYPES } from "@/data/cars";
import { useAddCar } from "@/hooks/useCars";
import { useAuth } from "@/hooks/useAuth";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";

export default function AddCarPage() {
  const { user } = useAuth();
  const addCar = useAddCar();
  const [, navigate] = useLocation();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [mileage, setMileage] = useState("0");
  const [bodyType, setBodyType] = useState("");
  const [color, setColor] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground mb-4">يجب تسجيل الدخول لإضافة سيارة</p>
          <Button onClick={() => navigate("/sign-in")}>تسجيل الدخول</Button>
        </div>
      </AppLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !year || !price || !bodyType || !color || !condition) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      await addCar.mutateAsync({
        brand,
        model,
        year: parseInt(year),
        price: parseFloat(price),
        mileage: parseInt(mileage) || 0,
        body_type: bodyType,
        color,
        condition,
        status: "متاح",
        description: description || null,
        features: null,
        images: images.length > 0 ? images : null,
        added_by: user.id,
      });
      toast.success("تم إضافة السيارة بنجاح!");
      navigate("/cars");
    } catch (err) {
      toast.error("حدث خطأ", { description: err instanceof Error ? err.message : "خطأ غير معروف" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">إضافة سيارة جديدة</h1>
          <p className="text-muted-foreground mt-1">أدخل بيانات السيارة</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الماركة *</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger><SelectValue placeholder="اختر الماركة" /></SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الموديل *</Label>
              <Input placeholder="مثال: كامري" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>سنة الصنع *</Label>
              <Input type="number" placeholder="2024" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>السعر (ريال) *</Label>
              <Input type="number" placeholder="150000" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>المسافة المقطوعة (كم)</Label>
              <Input type="number" placeholder="0" value={mileage} onChange={(e) => setMileage(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>نوع الهيكل *</Label>
              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                <SelectContent>
                  {BODY_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>اللون *</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger><SelectValue placeholder="اختر اللون" /></SelectTrigger>
                <SelectContent>
                  {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الحالة *</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="جديد">جديد</SelectItem>
                  <SelectItem value="مستعمل">مستعمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea placeholder="اكتب وصفاً تفصيلياً للسيارة..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>صور السيارة</Label>
            <ImageUpload images={images} onChange={setImages} maxImages={10} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" size="lg" disabled={addCar.isPending}>
              {addCar.isPending ? "جاري الإضافة..." : "إضافة السيارة"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate("/cars")}>إلغاء</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
