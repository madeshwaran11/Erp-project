import { useId } from "react";
import { IconArrowRight } from "./Icons";
import { formatStatus } from "../format";

const numberFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullNumberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function compactMoney(value) {
  if (!value) return "₹0";
  return `₹${numberFormatter.format(value)}`;
}

function fullMoney(value) {
  return `₹${fullNumberFormatter.format(value)}`;
}

function monthLabel(value) {
  if (!value) return "—";
  const [year, month] = String(value).split("-").map(Number);
  if (!year || !month) return value;
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "short",
  });
}

function chartPoints(series, key, left, top, plotWidth, plotHeight, scale) {
  if (!series.length) return [];
  const step = series.length > 1 ? plotWidth / (series.length - 1) : 0;
  return series.map((item, index) => ({
    x: left + step * index,
    y: top + plotHeight - (toNumber(item[key]) / scale) * plotHeight,
    value: toNumber(item[key]),
    label: item.label,
  }));
}

function linePath(points) {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    )
    .join(" ");
}

export function RevenueExpenseChart({ monthly = [] }) {
  const uid = useId().replace(/:/g, "");
  const series = (Array.isArray(monthly) ? monthly : [])
    .slice(-7)
    .map((item) => ({
      month: item.month,
      label: monthLabel(item.month),
      revenue: toNumber(item.invoiced),
      expenses: toNumber(item.expenses),
    }));

  const hasValues = series.some(
    (item) => item.revenue !== 0 || item.expenses !== 0
  );
  const maximum = Math.max(
    1,
    ...series.flatMap((item) => [item.revenue, item.expenses])
  );
  const scale = Math.max(1, maximum * 1.08);
  const width = 640;
  const height = 248;
  const margin = { top: 18, right: 18, bottom: 34, left: 54 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const baseline = margin.top + plotHeight;
  const revenuePoints = chartPoints(
    series,
    "revenue",
    margin.left,
    margin.top,
    plotWidth,
    plotHeight,
    scale
  );
  const expensePoints = chartPoints(
    series,
    "expenses",
    margin.left,
    margin.top,
    plotWidth,
    plotHeight,
    scale
  );
  const areaPath = revenuePoints.length
    ? `${linePath(revenuePoints)} L${revenuePoints.at(-1).x.toFixed(1)} ${baseline} L${revenuePoints[0].x.toFixed(1)} ${baseline} Z`
    : "";
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const totalRevenue = series.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = series.reduce((sum, item) => sum + item.expenses, 0);
  const net = totalRevenue - totalExpenses;

  return (
    <section className="analytics-card analytics-card-chart">
      <div className="analytics-head">
        <div>
          <span className="analytics-kicker">Financial performance</span>
          <h3>Revenue vs expenses</h3>
          <p>Recognised revenue and approved spend by month.</p>
        </div>
        <div className="analytics-legend" aria-label="Chart legend">
          <span>
            <i /> Revenue
          </span>
          <span>
            <i className="expense" /> Expenses
          </span>
        </div>
      </div>

      {series.length > 0 && (
        <div className="analytics-summary" aria-label="Financial totals for this period">
          <div>
            <span>Revenue</span>
            <strong>{fullMoney(totalRevenue)}</strong>
          </div>
          <div>
            <span>Expenses</span>
            <strong>{fullMoney(totalExpenses)}</strong>
          </div>
          <div className={net < 0 ? "is-negative" : "is-positive"}>
            <span>Net position</span>
            <strong>{fullMoney(net)}</strong>
          </div>
        </div>
      )}

      {series.length && hasValues ? (
        <div className="analytics-figure">
          <svg
            className="analytics-chart"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Monthly revenue and expenses chart"
          >
            <defs>
              <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                <stop offset="58%" stopColor="#60a5fa" stopOpacity="0.09" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.01" />
              </linearGradient>
              <linearGradient id={`${uid}-revenue`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="55%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id={`${uid}-expense`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>

            {ticks.map((tick) => {
              const y = margin.top + plotHeight - tick * plotHeight;
              return (
                <g key={tick}>
                  <line
                    className="analytics-grid-line"
                    x1={margin.left}
                    x2={width - margin.right}
                    y1={y}
                    y2={y}
                  />
                  <text
                    className="analytics-axis-label"
                    x={margin.left - 9}
                    y={y + 3.5}
                    textAnchor="end"
                  >
                    {compactMoney(scale * tick)}
                  </text>
                </g>
              );
            })}

            <path d={areaPath} fill={`url(#${uid}-area)`} />
            <path
              className="analytics-line revenue"
              d={linePath(revenuePoints)}
              stroke={`url(#${uid}-revenue)`}
            />
            <path
              className="analytics-line expense"
              d={linePath(expensePoints)}
              stroke={`url(#${uid}-expense)`}
            />

            {revenuePoints.map((point) => (
              <circle
                key={`revenue-${point.label}-${point.x}`}
                className="analytics-dot revenue"
                cx={point.x}
                cy={point.y}
                r="4"
              >
                <title>
                  {point.label} revenue: {fullMoney(point.value)}
                </title>
              </circle>
            ))}
            {expensePoints.map((point) => (
              <circle
                key={`expense-${point.label}-${point.x}`}
                className="analytics-dot expense"
                cx={point.x}
                cy={point.y}
                r="4"
              >
                <title>
                  {point.label} expenses: {fullMoney(point.value)}
                </title>
              </circle>
            ))}

            {series.map((item, index) => {
              const x =
                margin.left +
                (series.length > 1 ? plotWidth / (series.length - 1) : 0) *
                  index;
              return (
                <text
                  key={`label-${item.month}-${index}`}
                  className="analytics-axis-label"
                  x={x}
                  y={height - 9}
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="analytics-empty">
          <strong>No finance activity yet</strong>
          <span>
            Revenue and expenses will chart here once invoices and expenses are
            recorded.
          </span>
        </div>
      )}

      <p className="analytics-note">
        Revenue uses issued invoices by issue date. Expenses use approved and
        reimbursed records by expense date.
      </p>
    </section>
  );
}

function projectProgress(project, tasks) {
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  if (projectTasks.length) {
    const total = projectTasks.reduce((sum, task) => {
      const progress = Number(task.progress);
      if (Number.isFinite(progress)) return sum + progress;
      return sum + (task.status === "COMPLETED" ? 100 : 0);
    }, 0);
    return Math.max(0, Math.min(100, Math.round(total / projectTasks.length)));
  }

  const milestones = Array.isArray(project.milestones)
    ? project.milestones
    : [];
  if (milestones.length) {
    const complete = milestones.filter((milestone) => milestone.completed).length;
    return Math.round((complete / milestones.length) * 100);
  }

  if (project.status === "COMPLETED") return 100;
  return 0;
}

const DONUT_GROUPS = [
  { key: "COMPLETED", label: "Completed", color: "#14b8a6" },
  { key: "IN_PROGRESS", label: "In progress", color: "#2563eb" },
  { key: "PLANNING", label: "Planning", color: "#22d3ee" },
  { key: "ON_HOLD", label: "On hold", color: "#8b5cf6" },
  { key: "CANCELLED", label: "Cancelled", color: "#f43f5e" },
  { key: "OTHER", label: "Other", color: "#94a3b8" },
];

function statusGroup(project) {
  const status = String(project.status || "OTHER")
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  return DONUT_GROUPS.some((group) => group.key === status) ? status : "OTHER";
}

export function ProjectProgressCard({ projects = [], tasks = [], onNavigate }) {
  const allRows = projects.map((project) => ({
    ...project,
    progress: projectProgress(project, tasks),
    group: statusGroup(project),
  }));
  const rows = allRows
    .slice()
    .sort((first, second) => {
      if (first.status === "COMPLETED" && second.status !== "COMPLETED") return 1;
      if (second.status === "COMPLETED" && first.status !== "COMPLETED") return -1;
      return second.progress - first.progress;
    })
    .slice(0, 4);

  const averageProgress = allRows.length
    ? Math.round(
        allRows.reduce((sum, project) => sum + project.progress, 0) /
          allRows.length
      )
    : 0;

  const segments = DONUT_GROUPS.map((group) => ({
    ...group,
    count: allRows.filter((project) => project.group === group.key).length,
  })).filter((group) => group.count > 0);

  const totalProjects = allRows.length;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const arcs = segments.map((segment, index) => {
    const length = (segment.count / totalProjects) * circumference;
    const previousLength = segments
      .slice(0, index)
      .reduce(
        (sum, item) => sum + (item.count / totalProjects) * circumference,
        0
      );
    const gap = Math.min(3.5, length * 0.18);
    return {
      ...segment,
      dasharray: `${Math.max(0, length - gap)} ${circumference}`,
      dashoffset: -previousLength,
    };
  });

  return (
    <section className="analytics-card analytics-card-projects">
      <div className="analytics-head">
        <div>
          <span className="analytics-kicker">Delivery pulse</span>
          <h3>Project progress</h3>
          <p>Live delivery progress across your projects.</p>
        </div>
        <button
          type="button"
          className="overview-head-link"
          onClick={() => onNavigate?.("projects")}
        >
          All projects <IconArrowRight />
        </button>
      </div>

      {totalProjects ? (
        <>
          <div className="project-doughnut">
            <div className="project-doughnut-figure">
              <svg
                viewBox="0 0 124 124"
                role="img"
                aria-label={`Average project progress ${averageProgress} percent across ${totalProjects} projects`}
              >
                <circle
                  className="project-doughnut-track"
                  cx="62"
                  cy="62"
                  r={radius}
                />
                <g transform="rotate(-90 62 62)">
                  {arcs.map((arc) => (
                    <circle
                      key={arc.key}
                      className="project-doughnut-segment"
                      cx="62"
                      cy="62"
                      r={radius}
                      stroke={arc.color}
                      strokeDasharray={arc.dasharray}
                      strokeDashoffset={arc.dashoffset}
                    >
                      <title>
                        {arc.label}: {arc.count} project
                        {arc.count === 1 ? "" : "s"}
                      </title>
                    </circle>
                  ))}
                </g>
                <text
                  className="project-doughnut-value"
                  x="62"
                  y="59"
                  textAnchor="middle"
                >
                  {averageProgress}%
                </text>
                <text
                  className="project-doughnut-caption"
                  x="62"
                  y="75"
                  textAnchor="middle"
                >
                  average
                </text>
              </svg>
              <span className="project-doughnut-halo" aria-hidden="true" />
            </div>

            <div className="project-doughnut-legend">
              {segments.map((segment) => (
                <span key={segment.key}>
                  <i style={{ background: segment.color }} aria-hidden="true" />
                  <strong>{segment.count}</strong>
                  {segment.label}
                </span>
              ))}
            </div>
          </div>

          <div className="project-progress-list is-compact">
            {rows.map((project) => (
              <div className="project-progress-item" key={project.id}>
                <div className="project-progress-head">
                  <div className="project-progress-name">
                    <strong>{project.name}</strong>
                    <span>
                      {project.projectCode || "Project"} ·{" "}
                      {formatStatus(project.status)}
                    </span>
                  </div>
                  <span className="project-progress-value">
                    {project.progress}%
                  </span>
                </div>
                <div
                  className="progress-track"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={project.progress}
                  aria-label={`${project.name} progress`}
                >
                  <span
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="analytics-empty">
          <strong>No projects yet</strong>
          <span>Create a project to start tracking delivery progress.</span>
        </div>
      )}
    </section>
  );
}
