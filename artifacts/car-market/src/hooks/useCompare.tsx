import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Car } from "@/data/cars";

interface CompareContextType {
  selectedCars: Car[];
  toggle: (car: Car) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType>(null!);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedCars, setSelectedCars] = useState<Car[]>([]);

  const toggle = useCallback((car: Car) => {
    setSelectedCars((prev) => {
      if (prev.some((c) => c.id === car.id)) return prev.filter((c) => c.id !== car.id);
      if (prev.length >= 3) return prev;
      return [...prev, car];
    });
  }, []);

  const clear = useCallback(() => setSelectedCars([]), []);
  const isSelected = useCallback((id: string) => selectedCars.some((c) => c.id === id), [selectedCars]);

  return (
    <CompareContext.Provider value={{ selectedCars, toggle, clear, isSelected }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
