import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRANDS, COLORS, BODY_TYPES } from "@/data/cars";
import { toast } from "sonner";

export default function AddCarPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("تم إضافة السيارة بنجاح!", { description: "سيتم عرضها في القائمة." });
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
              <Label>الماركة</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="اختر الماركة" /></SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الموديل</Label>
              <Input placeholder="مثال: كامري" />
            </div>
            <div className="space-y-2">
              <Label>سنة الصنع</Label>
              <Input type="number" placeholder="2024" />
            </div>
            <div className="space-y-2">
              <Label>السعر (ريال)</Label>
              <Input type="number" placeholder="150000" />
            </div>
            <div className="space-y-2">
              <Label>المسافة المقطوعة (كم)</Label>
              <Input type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>نوع الهيكل</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                <SelectContent>
                  {BODY_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>اللون</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="اختر اللون" /></SelectTrigger>
                <SelectContent>
                  {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select>
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
            <Textarea placeholder="اكتب وصفاً تفصيلياً للسيارة..." rows={4} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" size="lg">إضافة السيارة</Button>
            <Button type="button" variant="outline" size="lg">إلغاء</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
