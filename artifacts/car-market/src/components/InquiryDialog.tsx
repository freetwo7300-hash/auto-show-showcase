import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

interface Props {
  carId: string;
  carName: string;
  open: boolean;
  onClose: () => void;
}

export function InquiryDialog({ carId, carName, open, onClose }: Props) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) return;
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ car_id: carId, ...form }),
      });
      if (!res.ok) throw new Error("failed");
      toast.success(t.inquiry.success);
      setForm({ name: "", email: "", phone: "", message: "" });
      onClose();
    } catch {
      toast.error(t.inquiry.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            {t.inquiry.title}
          </DialogTitle>
          <DialogDescription>{carName} — {t.inquiry.subtitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t.inquiry.name}</Label>
            <Input placeholder="محمد العمري" value={form.name} onChange={set("name")} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t.inquiry.phone}</Label>
              <Input placeholder="05xxxxxxxx" value={form.phone} onChange={set("phone")} required dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>{t.inquiry.email}</Label>
              <Input type="email" placeholder="email@example.com" value={form.email} onChange={set("email")} required dir="ltr" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t.inquiry.message}</Label>
            <Textarea
              placeholder={t.inquiry.messagePlaceholder}
              rows={3}
              value={form.message}
              onChange={set("message")}
              required
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t.inquiry.sending : t.inquiry.submit}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>{t.actions.cancel}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
