import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import placeholder from "@/assets/car-placeholder.jpg";
import { cn } from "@/lib/utils";

interface CarGalleryProps {
  images: string[];
  alt: string;
  status?: string;
  statusClass?: string;
}

export function CarGallery({ images, alt, status, statusClass }: CarGalleryProps) {
  const imgs = images.length > 0 ? images : [placeholder];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const [mainRef, mainApi] = useEmblaCarousel({ loop: true });
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
    direction: "ltr",
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi],
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    const idx = mainApi.selectedScrollSnap();
    setSelectedIndex(idx);
    thumbApi.scrollTo(idx);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    return () => { mainApi.off("select", onSelect); };
  }, [mainApi, onSelect]);

  const scrollPrev = useCallback(() => mainApi?.scrollPrev(), [mainApi]);
  const scrollNext = useCallback(() => mainApi?.scrollNext(), [mainApi]);

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden bg-muted">
        <div ref={mainRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {imgs.map((src, i) => (
              <div key={i} className="relative flex-none w-full h-64 md:h-[28rem]">
                <img
                  src={src}
                  alt={`${alt} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {imgs.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/70 backdrop-blur hover:bg-background/90"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/70 backdrop-blur hover:bg-background/90"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </>
        )}

        <button
          onClick={() => setZoomOpen(true)}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center hover:bg-background/90 transition-colors"
          aria-label="تكبير الصورة"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {status && (
          <div className="absolute top-3 right-3">
            <Badge className={statusClass}>{status}</Badge>
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {imgs.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={() => onThumbClick(i)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === selectedIndex ? "bg-white w-4" : "bg-white/50",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {imgs.length > 1 && (
        <div ref={thumbRef} className="overflow-hidden">
          <div className="flex gap-2">
            {imgs.map((src, i) => (
              <button
                key={i}
                onClick={() => onThumbClick(i)}
                className={cn(
                  "relative flex-none w-20 h-16 rounded-lg overflow-hidden bg-muted transition-all",
                  i === selectedIndex ? "ring-2 ring-primary opacity-100" : "opacity-60 hover:opacity-80",
                )}
              >
                <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-0 overflow-hidden">
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="relative">
            <img
              src={imgs[selectedIndex]}
              alt={alt}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            {imgs.length > 1 && (
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                {imgs.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedIndex(i); mainApi?.scrollTo(i); }}
                    className={cn(
                      "w-12 h-9 rounded overflow-hidden flex-none",
                      i === selectedIndex ? "ring-2 ring-white" : "opacity-50 hover:opacity-80",
                    )}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
