import { useState, useMemo } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, type ColumnDef,
} from "@tanstack/react-table";
import { AppLayout } from "@/components/layout/AppLayout";
import { useInquiries, useInquiryStats, useUpdateInquiry, type Inquiry } from "@/hooks/useInquiries";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/cars/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  MessageSquare, CheckCheck, X, Phone, Mail, RotateCcw,
  Inbox, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useI18n } from "@/i18n";

type StatusFilter = "all" | "new" | "responded" | "closed";

const STATUS_META: Record<string, { label: string; dot: string }> = {
  new:       { label: "جديد",          dot: "bg-blue-500"    },
  responded: { label: "تمت الاستجابة", dot: "bg-emerald-500" },
  closed:    { label: "مغلق",          dot: "bg-muted-foreground" },
};

const STATUS_ROW_CLASS: Record<string, string> = {
  new: "bg-blue-500/[0.04]",
};

export default function InquiriesPage() {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [globalFilter, setGlobalFilter] = useState("");

  const statsQuery  = useInquiryStats(isAdmin);
  const stats       = statsQuery.data;

  const inquiriesQuery = useInquiries(
    statusFilter !== "all" ? { status: statusFilter } : undefined,
    isAdmin,
  );
  const inquiries = inquiriesQuery.data ?? [];

  const updateInquiry = useUpdateInquiry();

  const setStatus = (id: string, status: string) => {
    updateInquiry.mutate(
      { id, status },
      {
        onSuccess: () => toast.success("تم تحديث حالة الاستفسار"),
        onError: () => toast.error("حدث خطأ، حاول مجدداً"),
      },
    );
  };

  /* ── TanStack Table columns ── */
  const columns = useMemo<ColumnDef<Inquiry>[]>(
    () => [
      {
        id: "status",
        header: "الحالة",
        accessorKey: "status",
        cell: ({ row }) => {
          const m = STATUS_META[row.original.status] ?? STATUS_META.new;
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap">
              <span className={cn("w-2 h-2 rounded-full shrink-0", m.dot)} />
              {m.label}
            </span>
          );
        },
        filterFn: "equalsString",
      },
      {
        id: "customer",
        header: t.inquiryMgmt.customer,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-medium text-sm truncate max-w-[140px]">{row.original.name}</p>
            <a
              href={`mailto:${row.original.email}`}
              className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1 truncate max-w-[160px]"
            >
              <Mail className="w-3 h-3 shrink-0" />
              {row.original.email}
            </a>
          </div>
        ),
      },
      {
        id: "phone",
        header: t.inquiryMgmt.phone,
        cell: ({ row }) => (
          <a
            href={`tel:${row.original.phone}`}
            className="flex items-center gap-1 text-sm hover:text-primary transition-colors whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            {row.original.phone}
          </a>
        ),
      },
      {
        id: "car",
        header: t.inquiryMgmt.car,
        cell: ({ row }) => (
          <Link
            href={`/cars/${row.original.car_id}`}
            className="text-primary text-xs hover:underline font-mono"
          >
            #{row.original.car_id.slice(0, 8)}…
          </Link>
        ),
      },
      {
        id: "message",
        header: t.inquiryMgmt.message,
        cell: ({ row }) => (
          <p className="text-xs text-muted-foreground line-clamp-2 max-w-[220px]">
            {row.original.message}
          </p>
        ),
      },
      {
        id: "date",
        header: t.inquiryMgmt.date,
        accessorKey: "created_at",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(row.original.created_at).toLocaleDateString("ar-SA", {
              year: "numeric", month: "short", day: "numeric",
            })}
          </span>
        ),
      },
      {
        id: "actions",
        header: t.inquiryMgmt.actions,
        cell: ({ row }) => {
          const { id, status } = row.original;
          const busy = updateInquiry.isPending;
          return (
            <div className="flex items-center gap-1 flex-nowrap">
              {status === "new" && (
                <Button
                  size="sm" variant="outline"
                  className="h-7 px-2 text-[11px] gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                  disabled={busy}
                  onClick={() => setStatus(id, "responded")}
                >
                  <CheckCheck className="w-3 h-3" />
                  {t.inquiryMgmt.markResponded}
                </Button>
              )}
              {status === "responded" && (
                <Button
                  size="sm" variant="ghost"
                  className="h-7 px-2 text-[11px] gap-1 text-muted-foreground"
                  disabled={busy}
                  onClick={() => setStatus(id, "closed")}
                >
                  <X className="w-3 h-3" />
                  {t.inquiryMgmt.markClosed}
                </Button>
              )}
              {status === "closed" && (
                <Button
                  size="sm" variant="ghost"
                  className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-blue-500"
                  disabled={busy}
                  onClick={() => setStatus(id, "new")}
                >
                  <RotateCcw className="w-3 h-3" />
                  {t.inquiryMgmt.reopen}
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [t, updateInquiry.isPending],
  );

  const table = useReactTable({
    data: inquiries,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  /* ── Not admin guard ── */
  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-4">
          <MessageSquare className="w-14 h-14 opacity-20" />
          <p className="text-lg font-display font-semibold">{t.inquiryMgmt.adminOnly}</p>
        </div>
      </AppLayout>
    );
  }

  const tabs: { key: StatusFilter; label: string; icon: React.ElementType; count?: number }[] = [
    { key: "all",       label: t.inquiryMgmt.allStatus,      icon: Inbox,         count: stats?.total     },
    { key: "new",       label: t.inquiryMgmt.statusNew,       icon: Clock,         count: stats?.new       },
    { key: "responded", label: t.inquiryMgmt.statusResponded, icon: CheckCircle2,  count: stats?.responded },
    { key: "closed",    label: t.inquiryMgmt.statusClosed,    icon: XCircle,       count: stats?.closed    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* ── Page header ── */}
        <div>
          <h1 className="text-2xl font-display font-bold">{t.inquiryMgmt.title}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t.inquiryMgmt.subtitle}</p>
        </div>

        {/* ── Stat row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statsQuery.isLoading
            ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            : (
              <>
                <StatCard title={t.inquiryMgmt.allStatus}      value={stats?.total     ?? 0} icon={Inbox}        />
                <StatCard title={t.inquiryMgmt.statusNew}       value={stats?.new       ?? 0} icon={Clock}        />
                <StatCard title={t.inquiryMgmt.statusResponded} value={stats?.responded ?? 0} icon={CheckCircle2} />
                <StatCard title={t.inquiryMgmt.statusClosed}    value={stats?.closed    ?? 0} icon={XCircle}      />
              </>
            )}
        </div>

        {/* ── Filter tabs + search ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {tabs.map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                  statusFilter === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {count !== undefined && count > 0 && (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0 rounded-full leading-4",
                    statusFilter === key
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary",
                  )}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 flex justify-end">
            <Input
              placeholder={t.inquiryMgmt.searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 max-w-xs"
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {inquiriesQuery.isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {columns.map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-5 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-16 text-muted-foreground">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p>{t.inquiryMgmt.noInquiries}</p>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b last:border-0 hover:bg-muted/30 transition-colors",
                        STATUS_ROW_CLASS[row.original.status] ?? "",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ── */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {t.table.showing} {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}{" "}
              {t.common.of} {table.getFilteredRowModel().rows.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                ›
              </Button>
              <span className="px-2 text-xs tabular-nums">
                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                ‹
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
