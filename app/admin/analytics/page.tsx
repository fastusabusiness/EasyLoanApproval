import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { isAdmin } from "@/lib/admin-auth";
import { STATUSES, STATUS_META } from "@/lib/application-status";
import { formatMoney as money } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { MARKET_META, MARKETS, type Market } from "@/lib/validation";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: "Analytics — Admin",
  robots: { index: false, follow: false },
};

// Status uses reserved state colors (not the categorical/magnitude green).
const STATUS_BAR: Record<string, string> = {
  received: "#94a3b8",
  reviewing: "#378add",
  approved: "#43a83a",
  rejected: "#e24b4a",
  funded: "#2e7d32",
};

const LEAF = "#43a83a";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5">
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <p className="font-display mt-1 text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}

// A horizontal bar row: label on the left, proportional fill, value at the end.
// Every bar is labelled so identity never rests on color alone.
function BarRow({
  label,
  value,
  max,
  color,
  display,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  display?: string;
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 4 : 0) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-24 shrink-0 text-sm font-medium text-ink">{label}</span>
      <div className="h-5 flex-1 overflow-hidden rounded-md bg-slate-100">
        <div
          className="h-full rounded-md"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-16 shrink-0 text-right text-sm font-bold tabular-nums text-navy">
        {display ?? value}
      </span>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5 sm:p-6">
      <h2 className="font-display text-lg font-bold tracking-tight text-ink">
        {title}
      </h2>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function AnalyticsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  // Analytics reflect active applications — archived (withdrawn/spam) excluded.
  const where = { archivedAt: null };

  const [apps, statusGroups, purposeGroups, stateGroups, marketGroups, approvedAgg] =
    await Promise.all([
      prisma.application.findMany({
        where,
        select: { amount: true, currency: true, createdAt: true },
      }),
      prisma.application.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),
      prisma.application.groupBy({
        by: ["purpose"],
        where,
        _count: { _all: true },
      }),
      prisma.application.groupBy({
        by: ["state"],
        where,
        _count: { _all: true },
      }),
      prisma.application.groupBy({
        by: ["market"],
        where,
        _count: { _all: true },
      }),
      prisma.application.groupBy({
        by: ["currency"],
        where: { ...where, approvedAmount: { not: null } },
        _sum: { approvedAmount: true },
      }),
    ]);

  // Different currencies can't share a sum — segment every money stat per
  // currency instead of assuming just USD/IDR.
  const totalApps = apps.length;
  const byCurrency = new Map<string, { total: number; count: number }>();
  for (const a of apps) {
    const cur = a.currency ?? "USD";
    const entry = byCurrency.get(cur) ?? { total: 0, count: 0 };
    entry.total += a.amount;
    entry.count += 1;
    byCurrency.set(cur, entry);
  }
  const approvedByCurrency = new Map(
    approvedAgg.map((g) => [g.currency ?? "USD", g._sum.approvedAmount ?? 0])
  );

  // Renders USD (or 0) first as the headline, then any other currency
  // present as "+ Rp X + R$ Y" secondary text.
  function moneyMulti(getAmount: (cur: string) => number): string {
    const currencies = new Set(["USD", ...byCurrency.keys()]);
    const usd = money(getAmount("USD"), "USD");
    const rest = [...currencies]
      .filter((c) => c !== "USD" && getAmount(c) > 0)
      .map((c) => `+ ${money(getAmount(c), c)}`);
    return [usd, ...rest].join(" ");
  }

  const totalMoney = moneyMulti((cur) => byCurrency.get(cur)?.total ?? 0);
  const avgMoney = moneyMulti((cur) => {
    const entry = byCurrency.get(cur);
    return entry && entry.count > 0 ? entry.total / entry.count : 0;
  });
  const approvedMoney = moneyMulti((cur) => approvedByCurrency.get(cur) ?? 0);

  const statusCounts = STATUSES.map((s) => ({
    label: STATUS_META[s].label,
    value: statusGroups.find((g) => g.status === s)?._count._all ?? 0,
    color: STATUS_BAR[s] ?? "#94a3b8",
  }));
  const statusMax = Math.max(1, ...statusCounts.map((s) => s.value));

  const purposeCounts = purposeGroups
    .map((g) => ({ label: g.purpose, value: g._count._all }))
    .sort((a, b) => b.value - a.value);
  const purposeMax = Math.max(1, ...purposeCounts.map((p) => p.value));

  const stateCounts = stateGroups
    .map((g) => ({ label: g.state ?? "Unknown", value: g._count._all }))
    .sort((a, b) => b.value - a.value);
  const stateMax = Math.max(1, ...stateCounts.map((s) => s.value));

  const marketCounts = MARKETS.map((m) => ({
    label: `${MARKET_META[m].flag} ${m}`,
    value: marketGroups.find((g) => g.market === m)?._count._all ?? 0,
  })).filter((m) => m.value > 0);
  const marketMax = Math.max(1, ...marketCounts.map((m) => m.value));

  // Applications per day over the last 14 days.
  const DAYS = 14;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets: { key: string; label: string; value: number }[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: 0,
    });
  }
  const bucketByKey = new Map(buckets.map((b) => [b.key, b]));
  for (const a of apps) {
    const key = a.createdAt.toISOString().slice(0, 10);
    const b = bucketByKey.get(key);
    if (b) b.value += 1;
  }
  const trendMax = Math.max(1, ...buckets.map((b) => b.value));

  return (
    <main className="min-h-screen bg-sun-soft/50">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <BrandLogo className="h-9 w-9" />
          <span className="font-display text-2xl font-bold tracking-tight text-navy">
            Easy Loan Approval
          </span>
          <span className="ml-2 rounded-full bg-navy px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Admin
          </span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border-2 border-slate-200 px-5 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
          >
            Log out
          </button>
        </form>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Analytics
          </h1>
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
          >
            ← Applications
          </a>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Active applications only — archived applications are excluded.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Applications" value={String(totalApps)} />
          <StatTile label="Total requested" value={totalMoney} />
          <StatTile label="Avg loan size" value={avgMoney} />
          <StatTile label="Approved to date" value={approvedMoney} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <ChartCard
            title="Status funnel"
            subtitle="Where applications sit in the pipeline"
          >
            <div>
              {statusCounts.map((s) => (
                <BarRow
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  max={statusMax}
                  color={s.color}
                />
              ))}
            </div>
          </ChartCard>

          <ChartCard title="By purpose" subtitle="What people borrow for">
            {purposeCounts.length > 0 ? (
              <div>
                {purposeCounts.map((p) => (
                  <BarRow
                    key={p.label}
                    label={p.label}
                    value={p.value}
                    max={purposeMax}
                    color={LEAF}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No data yet.</p>
            )}
          </ChartCard>

          <ChartCard title="By market" subtitle="Which country applicants apply from">
            {marketCounts.length > 0 ? (
              <div>
                {marketCounts.map((m) => (
                  <BarRow
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    max={marketMax}
                    color={LEAF}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No data yet.</p>
            )}
          </ChartCard>

          <ChartCard title="By state" subtitle="US applicants only">
            {stateCounts.length > 0 ? (
              <div>
                {stateCounts.slice(0, 10).map((s) => (
                  <BarRow
                    key={s.label}
                    label={s.label}
                    value={s.value}
                    max={stateMax}
                    color={LEAF}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No data yet.</p>
            )}
          </ChartCard>

          <ChartCard
            title="Last 14 days"
            subtitle="Applications received per day"
          >
            <div className="flex h-40 items-end gap-1.5">
              {buckets.map((b) => (
                <div
                  key={b.key}
                  className="flex flex-1 flex-col items-center gap-1"
                  title={`${b.label}: ${b.value}`}
                >
                  <span className="text-[10px] font-bold tabular-nums text-navy">
                    {b.value > 0 ? b.value : ""}
                  </span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${(b.value / trendMax) * 100}%`,
                        minHeight: b.value > 0 ? "4px" : "0",
                        backgroundColor: LEAF,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {b.label.split(" ")[1]}
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </main>
  );
}
