import {
  AreaChart,
  Area,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const PRIMARY = "oklch(0.78 0.17 152)";
const MUTED = "oklch(0.5 0.01 270)";
const DANGER = "oklch(0.66 0.21 22)";

export function Sparkline({
  data,
  tone = "primary",
}: {
  data: number[];
  tone?: "primary" | "danger" | "muted";
}) {
  const color = tone === "danger" ? DANGER : tone === "muted" ? MUTED : PRIMARY;
  const id = `spk-${tone}-${data.length}`;
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.map((v, i) => ({ i, v }))}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HourlyBars({
  data,
  peakIndex,
}: {
  data: { hour: string; v: number }[];
  peakIndex: number;
}) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="hour"
            tick={{ fill: "oklch(0.55 0.01 270)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "oklch(0.25 0.006 270 / 0.6)" }}
            contentStyle={{
              background: "oklch(0.2 0.006 270)",
              border: "1px solid oklch(0.28 0.006 270)",
              borderRadius: 10,
              fontSize: 11,
            }}
          />
          <Bar dataKey="v" radius={[3, 3, 0, 0]}>
            {data.map((_, idx) => (
              <Cell
                key={idx}
                fill={idx === peakIndex ? PRIMARY : "oklch(0.3 0.006 270)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ForecastLine({
  data,
}: {
  data: { d: string; real?: number; forecast?: number }[];
}) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="d" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "oklch(0.2 0.006 270)",
              border: "1px solid oklch(0.28 0.006 270)",
              borderRadius: 10,
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="real"
            stroke={PRIMARY}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke={PRIMARY}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HealthRing({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className="grid size-28 place-items-center rounded-full"
      style={{
        background: `conic-gradient(var(--primary) ${pct}%, oklch(0.28 0.006 270) 0)`,
      }}
      aria-label={`Health score ${pct}%`}
    >
      <div className="grid size-[88px] place-items-center rounded-full bg-background">
        <div className="text-center leading-tight">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Health
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{pct}</p>
        </div>
      </div>
    </div>
  );
}

export function Heatmap({ data }: { data: number[][] }) {
  // data: rows=days (7), cols=hours (12)
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  return (
    <div className="flex items-stretch gap-1.5">
      <div className="flex flex-col justify-around text-[9px] font-mono text-muted-foreground">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid flex-1 grid-rows-7 gap-1">
        {data.map((row, ri) => (
          <div key={ri} className="grid grid-cols-12 gap-1">
            {row.map((v, ci) => (
              <div
                key={ci}
                className="aspect-square rounded-[3px]"
                style={{
                  background:
                    v === 0
                      ? "oklch(0.22 0.006 270)"
                      : `color-mix(in oklab, var(--primary) ${Math.round(
                          v * 90,
                        )}%, oklch(0.22 0.006 270))`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}