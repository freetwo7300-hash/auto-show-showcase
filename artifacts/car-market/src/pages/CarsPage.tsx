import { useState, useMemo } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { AppLayout } from "@/components/layout/AppLayout";
import { CarCard } from "@/components/cars/CarCard";
import { CarFilters, Filters } from "@/components/cars/CarFilters";
import { useCars, type DbCar } from "@/hooks/useCars";
import { carsData, Car } from "@/data/cars";
import { LayoutGrid, List, Table2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useI18n } from "@/i18n";

const initialFilters: Filters = {
  search: "", brand: "", condition: "", bodyType: "", color: "", yearFrom: "", yearTo: "", priceFrom: "", priceTo: "",
};

const mapDbCar = (c: DbCar): Car => ({
  id: c.id, brand: c.brand, model: c.model, year: c.year,
  price: Number(c.price), mileage: c.mileage,
  condition: c.condition as "جديد" | "مستعمل",
  color: c.color, fuelType: "بنزين", transmission: "أوتوماتيك", engine: "",
  bodyType: c.body_type, description: c.description || "",
  images: c.images || [], features: c.features || [],
  status: c.status as "متاح" | "محجوز" | "مباع",
});

const statusClass: Record<string, string> = {
  "متاح": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "محجوز": "bg-amber-500/10 text-amber-600 border-amber-200",
  "مباع": "bg-red-500/10 text-red-600 border-red-200",
};

function SortIcon({ dir }: { dir: false | "asc" | "desc" }) {
  if (!dir) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
  return dir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
}

export default function CarsPage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [view, setView] = useState<"grid" | "list" | "table">("grid");
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data: dbCars, isLoading } = useCars();

  const cars: Car[] = useMemo(() => {
    if (dbCars && dbCars.length > 0) return dbCars.map(mapDbCar);
    return carsData;
  }, [dbCars]);

  const filtered = useMemo(() => {
    return cars.filter((car) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!car.brand.toLowerCase().includes(q) && !car.model.toLowerCase().includes(q)) return false;
      }
      if (filters.brand && car.brand !== filters.brand) return false;
      if (filters.condition && car.condition !== filters.condition) return false;
      if (filters.bodyType && car.bodyType !== filters.bodyType) return false;
      if (filters.color && car.color !== filters.color) return false;
      return true;
    });
  }, [filters, cars]);

  const columns: ColumnDef<Car>[] = useMemo(() => [
    {
      accessorFn: (r) => `${r.brand} ${r.model}`,
      id: "brandModel",
      header: ({ column }) => (
        <button className="flex items-center gap-1.5 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t.table.brandModel} <SortIcon dir={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => (
        <Link href={`/cars/${row.original.id}`} className="hover:text-primary transition-colors">
          <p className="font-semibold">{row.original.brand} {row.original.model}</p>
          <p className="text-xs text-muted-foreground">{row.original.bodyType}</p>
        </Link>
      ),
    },
    {
      accessorKey: "year",
      header: ({ column }) => (
        <button className="flex items-center gap-1.5 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t.table.year} <SortIcon dir={column.getIsSorted()} />
        </button>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <button className="flex items-center gap-1.5 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t.table.price} <SortIcon dir={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-bold text-primary">{row.original.price.toLocaleString("ar-SA")} {t.car.sar}</span>
      ),
    },
    {
      accessorKey: "mileage",
      header: ({ column }) => (
        <button className="flex items-center gap-1.5 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t.table.mileage} <SortIcon dir={column.getIsSorted()} />
        </button>
      ),
      cell: ({ row }) => <span>{row.original.mileage.toLocaleString()} {t.car.km}</span>,
    },
    {
      accessorKey: "status",
      header: t.table.status,
      cell: ({ row }) => (
        <Badge className={cn("text-xs border", statusClass[row.original.status])}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "condition",
      header: t.table.condition,
      cell: ({ row }) => <Badge variant="secondary" className="text-xs">{row.original.condition}</Badge>,
    },
    {
      id: "actions",
      header: t.table.actions,
      cell: ({ row }) => (
        <Button size="sm" variant="outline" asChild>
          <Link href={`/cars/${row.original.id}`}>{t.actions.view}</Link>
        </Button>
      ),
    },
  ], [t]);

  const tableData = view === "table" ? (globalFilter
    ? filtered.filter((c) => {
        const q = globalFilter.toLowerCase();
        return c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q);
      })
    : filtered)
    : filtered;

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-display font-bold">{t.nav.cars}</h1>
            <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground text-sm">
              <Badge variant="secondary">{filtered.length}</Badge>
              سيارة متوفرة
            </div>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", view === "grid" && "bg-card shadow-sm")} onClick={() => setView("grid")}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", view === "list" && "bg-card shadow-sm")} onClick={() => setView("list")}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", view === "table" && "bg-card shadow-sm")} onClick={() => setView("table")}>
              <Table2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CarFilters filters={filters} onChange={setFilters} />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : view === "table" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder={t.common.search}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-xs h-9"
              />
              <span className="text-sm text-muted-foreground">
                {table.getFilteredRowModel().rows.length} {t.table.entries}
              </span>
            </div>
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    {table.getHeaderGroups().map((hg) => (
                      <tr key={hg.id}>
                        {hg.headers.map((header) => (
                          <th key={header.id} className="px-4 py-3 text-start text-muted-foreground font-medium whitespace-nowrap">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                          {t.car.noResults}
                        </td>
                      </tr>
                    ) : table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {t.table.showing} {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                {" "}{t.table.to}{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length,
                )}
                {" "}{t.table.entries} ({table.getFilteredRowModel().rows.length} {t.common.total})
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8"
                  onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <span className="flex items-center gap-1 px-3 text-xs">
                  {t.common.page} {table.getState().pagination.pageIndex + 1} {t.common.of} {table.getPageCount()}
                </span>
                <Button variant="outline" size="icon" className="h-8 w-8"
                  onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">{t.car.noResults}</p>
            <Button variant="ghost" className="mt-2" onClick={() => setFilters(initialFilters)}>{t.car.resetFilters}</Button>
          </div>
        ) : (
          <div className={cn("grid gap-4", view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
            {filtered.map((car, i) => <CarCard key={car.id} car={car} delay={i * 80} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
