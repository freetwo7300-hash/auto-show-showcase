import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { User } from "lucide-react";

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !token) { setLoading(false); return; }
    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setDisplayName(data.display_name || "");
          setPhone(data.phone || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, token]);

  if (!user) {
    return <AppLayout><div className="text-center py-20">
      <p className="text-xl mb-4">سجّل الدخول لعرض ملفك</p>
      <Button asChild><Link to="/auth">تسجيل الدخول</Link></Button>
    </div></AppLayout>;
  }

  const save = async () => {
    if (!token) return;
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName, phone }),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error((err as any).error ?? "حدث خطأ");
    } else {
      toast.success("تم حفظ البيانات");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <User className="w-7 h-7" /> الملف الشخصي
        </h1>
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {(displayName || user.email || "م").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold">{displayName || "بدون اسم"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {loading ? <p>جاري التحميل...</p> : (
            <>
              <div className="space-y-2"><Label>الاسم الظاهر</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="اسمك" /></div>
              <div className="space-y-2"><Label>رقم الهاتف</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966..." /></div>
              <Button onClick={save} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</Button>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
