// Split out from dashboard.tsx and loaded with React.lazy (see DashboardPage)
// so recharts — a sizeable library — is only ever downloaded for the AE, who
// is the only one who sees these charts. Authors' dashboards never pay for it.
import { Activity } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const AXIS_COLOR = "oklch(0.45 0.08 300)";
const GRID_COLOR = "oklch(0.90 0.03 305)";
const PRIMARY = "oklch(0.60 0.22 300)"; // borahae purple
const SECONDARY = "oklch(0.76 0.15 350)"; // bubblegum pink
const PIE_COLORS = [PRIMARY, SECONDARY, "oklch(0.90 0.13 95)", "oklch(0.88 0.08 170)"];
const tooltipStyle = {
  background: "white",
  border: "2.5px solid oklch(0.30 0.09 300)",
  borderRadius: 16,
  boxShadow: "3px 3px 0 oklch(0.30 0.09 300 / 0.9)",
  fontSize: 12,
  fontFamily: "Fredoka, system-ui, sans-serif",
};

export default function DashboardCharts({
  earningsSeries,
  contractMix,
  platformSeries,
  genreSeries,
}: {
  earningsSeries: { month: string; earnings: number }[];
  contractMix: { name: string; value: number }[];
  platformSeries: { name: string; contracts: number }[];
  genreSeries: { name: string; value: number }[];
}) {
  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Trend</p>
              <h3 className="text-xl font-bold mt-1">Monthly AE earnings</h3>
            </div>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsSeries}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="month" stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="earnings" stroke={PRIMARY} strokeWidth={2} fill="url(#earningsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass rounded-2xl p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mix</p>
          <h3 className="text-xl font-bold mt-1 mb-6">Contract type</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contractMix.length ? contractMix : [{ name: "—", value: 1 }]}
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {contractMix.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {contractMix.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Performance</p>
          <h3 className="text-xl font-bold mt-1 mb-6">Contracts by platform</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformSeries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis type="number" stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke={AXIS_COLOR} fontSize={11} width={90} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="contracts" fill={PRIMARY} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass rounded-2xl p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Demand</p>
          <h3 className="text-xl font-bold mt-1 mb-6">Top genres</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="name" stroke={AXIS_COLOR} fontSize={10} angle={-15} height={50} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill={SECONDARY} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </>
  );
}
