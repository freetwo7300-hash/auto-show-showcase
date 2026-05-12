import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useCars, useFavorites, useToggleFavorite } from "@/hooks/useCars";
import { useI18n } from "@/i18n";
import placeholder from "@/assets/car-placeholder.jpg";
import { cn } from "@/lib/utils";
import type { DbCar } from "@/hooks/useCars";

interface Props {
  open: boolean;
  onClose: () => void;
}

const statusClass: Record<string, string> = {
  متاح: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  محجوز: "bg-amber-500/10 text-amber-600 border-amber-200",
  مباع: "bg-red-500/10 text-red-600 border-red-200",
};

function FavCarItem({ car, userId, onClose }: { car: DbCar; userId: string; onClose: () => void }) {
  const { t } = useI18n();
  const toggle = useToggleFavorite(userId);
  const cover = car.images?.[0] || placeholder;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/30 transition-colors group">
      <Link href={`/cars/${car.id}`} onClick={onClose} className="flex-none">
        <img src={cover} alt={`${car.brand} ${car.model}`} className="w-16 h-12 rounded-lg object-cover" />
      </Link>
      <Link href={`/cars/${car.id}`} onClick={onClose} className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{car.brand} {car.model}</p>
        <p className="text-xs text-muted-foreground">{car.year}</p>
        <p className="text-primary font-bold text-sm">{Number(car.price).toLocaleString("ar-SA")} {t.car.sar}</p>
      </Link>
      <div className="flex flex-col items-end gap-2 flex-none">
        <Badge className={cn("text-xs border", statusClass[car.status] || "")}>{car.status}</Badge>
        <button
          onClick={() => toggle.mutate({ carId: car.id, isFav: true })}
          className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          aria-label={t.favorites.remove}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function FavoritesDrawer({ open, onClose }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: allCars = [] } = useCars();
  const { data: favIds = [] } = useFavorites(user?.id);

  const favCars = allCars.filter((c) => favIds.includes(c.id));

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-80 sm:w-96 flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
            {t.favorites.title}
            {favCars.length > 0 && (
              <Badge variant="secondary" className="text-xs">{favCars.length}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {!user ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-4">{t.favorites.signInPrompt}</p>
              <Button size="sm" asChild onClick={onClose}>
                <Link href="/sign-in">{t.nav.signIn}</Link>
              </Button>
            </div>
          ) : favCars.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium mb-1">{t.favorites.empty}</p>
              <p className="text-xs">{t.favorites.emptyHint}</p>
            </div>
          ) : (
            favCars.map((c) => (
              <FavCarItem key={c.id} car={c} userId={user.id} onClose={onClose} />
            ))
          )}
        </div>

        {favCars.length > 0 && (
          <div className="px-4 pb-5 border-t pt-4">
            <Button variant="outline" className="w-full gap-2" asChild onClick={onClose}>
              <Link href="/cars">
                {t.nav.cars} <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
