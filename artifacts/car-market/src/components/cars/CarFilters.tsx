import { BRANDS, COLORS, BODY_TYPES } from "@/data/cars";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Filters {
  search: string;
  brand: string;
  condition: string;
  bodyType: string;
  color: string;
  yearFrom: string;
  yearTo: string;
  priceFrom: string;
  priceTo: string;
}

interface CarFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function CarFilters({ filters, onChange }: CarFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value === "all" ? "" : value });
  };

  return (
    <div className="bg-card rounded-xl border p-4 space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن سيارة..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="pr-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className={cn(expanded && "bg-primary text-primary-foreground")}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 animate-fade-in">
          <Select value={filters.brand || "all"} onValueChange={(v) => update("brand", v)}>
            <SelectTrigger><SelectValue placeholder="الماركة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الماركات</SelectItem>
              {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.condition || "all"} onValueChange={(v) => update("condition", v)}>
            <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="جديد">جديد</SelectItem>
              <SelectItem value="مستعمل">مستعمل</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.bodyType || "all"} onValueChange={(v) => update("bodyType", v)}>
            <SelectTrigger><SelectValue placeholder="نوع الهيكل" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {BODY_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.color || "all"} onValueChange={(v) => update("color", v)}>
            <SelectTrigger><SelectValue placeholder="اللون" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الألوان</SelectItem>
              {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
