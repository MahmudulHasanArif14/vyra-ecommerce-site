"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

/* ============================================================ */
/* Custom Tooltip — dark mode friendly                          */
/* ============================================================ */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#141414] border border-white/10 rounded-lg px-3 py-2 shadow-2xl backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-400 capitalize">
            {String(entry.dataKey)
              .replace(/([A-Z])/g, " $1")
              .trim()}
            :
          </span>
          <span className="font-medium text-white tabular-nums">
            {entry.dataKey === "revenue" ? "৳" : ""}
            {Number(entry.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================ */
/* Chart Card Wrapper                                            */
/* ============================================================ */
function ChartCard({
  title,
  subtitle,
  children,
  accent,
  index = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent: "cyan" | "blue" | "purple" | "green";
  index?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 120);
    return () => clearTimeout(timer);
  }, [index]);

  const accentColors = {
    cyan: {
      glow: "bg-cyan-500/10",
      dot: "bg-cyan-400",
    },
    blue: {
      glow: "bg-blue-500/10",
      dot: "bg-blue-400",
    },
    purple: {
      glow: "bg-purple-500/10",
      dot: "bg-purple-400",
    },
    green: {
      glow: "bg-green-500/10",
      dot: "bg-green-400",
    },
  };

  const colors = accentColors[accent];

  return (
    <div
      className={`bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6 transition-all duration-700 hover:border-white/20 relative overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Accent glow */}
      <div
        className={`absolute -top-20 -right-20 w-40 h-40 rounded-full ${colors.glow} blur-3xl pointer-events-none`}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            <h2 className="text-sm md:text-base font-semibold text-white tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">{children}</div>
    </div>
  );
}

/* ============================================================ */
/* Main Component                                                */
/* ============================================================ */
export default function AnalyticsCharts({ data }: { data: any[] }) {
  if (!data?.length) {
    return (
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6"
          >
            <div className="h-4 w-24 bg-white/5 rounded mb-4 animate-pulse" />
            <div className="h-[220px] md:h-[280px] bg-white/[0.02] rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const axisStyle = {
    fontSize: 10,
    fill: "#737373",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  };

  const gridStyle = {
    stroke: "rgba(255, 255, 255, 0.06)",
    strokeDasharray: "3 3",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* ============================================================ */}
      {/* REVENUE */}
      {/* ============================================================ */}
      <ChartCard title="Revenue" subtitle="BDT" accent="cyan" index={0}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis
              dataKey="date"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#22d3ee",
                stroke: "#0a0a0a",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ============================================================ */}
      {/* VISITORS */}
      {/* ============================================================ */}
      <ChartCard
        title="Visitors"
        subtitle="Unique per day"
        accent="blue"
        index={1}
      >
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis
              dataKey="date"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#visitorsGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#3b82f6",
                stroke: "#0a0a0a",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ============================================================ */}
      {/* ORDERS */}
      {/* ============================================================ */}
      <ChartCard
        title="Orders"
        subtitle="Placed per day"
        accent="purple"
        index={2}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis
              dataKey="date"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={40}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar
              dataKey="orders"
              fill="url(#ordersGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ============================================================ */}
      {/* PAGE VIEWS */}
      {/* ============================================================ */}
      <ChartCard
        title="Page Views"
        subtitle="Total per day"
        accent="green"
        index={3}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis
              dataKey="date"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={40}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar
              dataKey="pageViews"
              fill="url(#viewsGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
