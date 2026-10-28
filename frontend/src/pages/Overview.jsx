import BusinessScene from "../components/BusinessScene";
import { useEffect, useState } from "react";
import {
  fetchDashboardMetrics,
  fetchFinanceSummary,
  listEmployees,
  listInvoices,
  listLeads,
  listProjects,
  listTasks,
  verifyDashboardSession,
} from "../api";
import { request } from "../workspaceApi";
import { formatDate, formatMoney, formatStatus, priorityTone, statusTone } from "../format";
import StatCard from "../components/StatCard";
import StatusPanel from "../components/StatusPanel";
import {
  ProjectProgressCard,
  RevenueExpenseChart,
} from "../components/DashboardCharts";
import {
  IconAlert,
  IconArrowRight,
  IconCalendar,
  IconChart,
  IconClients,
  IconClock,
  IconExpense,
  IconFollowUp,
  IconInvoice,
  IconMarketing,
  IconPlus,
  IconProjects,
  IconSparkles,
  IconTasks,
  IconUsers,
  IconWallet,
} from "../components/Icons";

const pageSize = 100;

const quickActions = [
  {
    id: "people",
    label: "Add employee",
    description: "Bring a new teammate into the workspace.",
    icon: IconUsers,
    tone: "sky",
  },
  {
    id: "projects",
    label: "Create project",
    description: "Start a delivery plan and assign a team.",
    icon: IconProjects,
    tone: "blue",
  },
  {
    id: "leads",
    label: "Add lead",
    description: "Capture a new opportunity in the pipeline.",
    icon: IconFollowUp,
    tone: "violet",
  },
  {
    id: "invoices",
    label: "Create invoice",
    description: "Bill a customer and track the balance.",
    icon: IconInvoice,
    tone: "teal",
  },
  {
    id: "expenses",
    label: "Add expense",
    description: "Record business spend for approval.",
    icon: IconExpense,
    tone: "amber",
  },
  {
    id: "marketing",
    label: "Launch campaign",
    description: "Plan a new digital marketing campaign.",
    icon: IconMarketing,
    tone: "rose",
  },
];

function displayNameFromEmail(email) {
  return (email || "there")
    .split("@")[0]
    .split(/[._\-+\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function relativeTime(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const seconds = Math.round((parsed.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const divisions = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ];

  let duration = seconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return formatter.format(Math.round(duration), "year");
}

function actionLabel(value) {
  const text = String(value || "activity").replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function resourceLabel(value) {
  const parts = String(value || "workspace")
    .replace(/^\/api\//, "")
    .split("/")
    .filter(Boolean);
  if (["platform", "workspace"].includes(parts[0])) parts.shift();
  const label = (parts[0] || "workspace").replace(/-/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function statusClass(value) {
  return `dash-status-pill status-${statusTone(value)}`;
}

function ListCard({
  title,
  description,
  onViewAll,
  viewAllLabel,
  children,
  emptyTitle,
  emptyDescription,
}) {
  return (
    <section className="overview-list-card">
      <div className="overview-list-head">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {onViewAll && (
          <button
            type="button"
            className="overview-head-link"
            onClick={onViewAll}
          >
            {viewAllLabel || "View all"} <IconArrowRight />
          </button>
        )}
      </div>
      {children || (
        <div className="overview-empty">
          <strong>{emptyTitle || "Nothing here yet"}</strong>
          <span>{emptyDescription}</span>
        </div>
      )}
    </section>
  );
}

export default function Overview({ session, onNavigate }) {
  const [sessionCheck, setSessionCheck] = useState({
    state: "loading",
    message: "",
  });
  const [dashboard, setDashboard] = useState({ state: "loading", data: null });
  const [dataRetry, setDataRetry] = useState(0);
  const token = session.token;

  useEffect(() => {
    let active = true;
    verifyDashboardSession(token)
      .then(() => {
        if (active) setSessionCheck({ state: "success", message: "" });
      })
      .catch((error) => {
        if (!active) return;
        setSessionCheck({
          state: error.code === "UNAUTHORIZED" ? "unauthorized" : "error",
          message: error.message,
        });
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let active = true;
    const safe = (promise) => promise.catch(() => null);

    Promise.all([
      safe(fetchDashboardMetrics(token)),
      safe(fetchFinanceSummary(token)),
      safe(listEmployees(token)),
      safe(listProjects(token, { page: 1, size: pageSize })),
      safe(listLeads(token, { page: 1, size: pageSize })),
      safe(listTasks(token, { page: 1, size: pageSize })),
      safe(listInvoices(token, { page: 1, size: pageSize })),
      safe(listTasks(token, { overdue: true, page: 1, size: 6 })),
      safe(listInvoices(token, { overdue: true, page: 1, size: 6 })),
      safe(request("/api/workspace/leave?status=SUBMITTED&page=1&size=10")),
      safe(request("/api/platform/audit?page=1&size=7")),
    ]).then(
      ([
        metrics,
        finance,
        employees,
        projects,
        leads,
        tasks,
        invoices,
        overdueTasks,
        overdueInvoices,
        leave,
        audit,
      ]) => {
        if (!active) return;

        const criticalMissing = !metrics && !finance;
        const failedSections = [
          metrics,
          finance,
          employees,
          projects,
          leads,
          tasks,
          invoices,
          overdueTasks,
          overdueInvoices,
          leave,
          audit,
        ].filter((value) => value === null).length;

        setDashboard({
          state: criticalMissing ? "error" : "success",
          data: criticalMissing
            ? null
            : {
                metrics: metrics || {},
                finance: finance || {},
                employees: employees || [],
                projects: projects?.items || [],
                projectTotal: projects?.total || 0,
                leads: leads?.items || [],
                leadTotal: leads?.total || 0,
                tasks: tasks?.items || [],
                taskTotal: tasks?.total || 0,
                invoices: invoices?.items || [],
                invoiceTotal: invoices?.total || 0,
                overdueTasks: overdueTasks?.items || [],
                overdueTaskTotal: overdueTasks?.total || 0,
                overdueInvoices: overdueInvoices?.items || [],
                overdueInvoiceTotal: overdueInvoices?.total || 0,
                leave: leave?.items || [],
                audit: audit?.items || [],
                partial: failedSections > 0,
              },
        });
      }
    );

    return () => {
      active = false;
    };
  }, [token, dataRetry]);

  const data = dashboard.data;
  const metrics = data?.metrics || {};
  const finance = data?.finance || {};
  const employees = data?.employees || [];
  const projects = data?.projects || [];
  const tasks = data?.tasks || [];
  const leads = data?.leads || [];
  const leave = data?.leave || [];
  const audit = data?.audit || [];
  const overdueTasks = data?.overdueTasks || [];
  const overdueInvoices = data?.overdueInvoices || [];

  const employeeNames = new Map(
    employees.map((employee) => [employee.id, employee.fullName])
  );
  const today = new Date();
  const greetingName =
    session.fullName || session.name || displayNameFromEmail(session.email);
  const currentDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const recentLeads = [...leads]
    .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
    .slice(0, 5);

  const upcomingTasks = [...tasks]
    .filter((task) => task.status !== "COMPLETED" && task.dueDate)
    .sort((first, second) => String(first.dueDate).localeCompare(String(second.dueDate)))
    .slice(0, 5);

  const pendingLeave = [...leave]
    .filter((item) => item.status === "SUBMITTED")
    .sort((first, second) =>
      String(first.values?.startDate || "").localeCompare(
        String(second.values?.startDate || "")
      )
    )
    .slice(0, 5);

  const recentActivity = audit.slice(0, 7);
  const revenue = finance.totalInvoiced;
  const expenses = finance.approvedExpenseTotal;
  const profit = finance.netProfit;
  const employeeCount = employees.length;
  const overdueTaskCount =
    data?.overdueTaskTotal || metrics.overdueTasks || overdueTasks.length;
  const overdueInvoiceCount =
    data?.overdueInvoiceTotal ||
    finance.overdueInvoiceCount ||
    overdueInvoices.length;
  const hasOverdue = overdueTaskCount > 0 || overdueInvoiceCount > 0;

  const sessionLabel =
    sessionCheck.state === "success"
      ? "Session verified"
      : sessionCheck.state === "loading"
        ? "Verifying session"
        : "Session check failed";

  function retryDashboard() {
    setDashboard({ state: "loading", data: null });
    setDataRetry((count) => count + 1);
  }

  return (
    <div className="dash-page overview-page">
      <section className="overview-hero">
        <div className="overview-hero-copy">
          <h2>Welcome back,<br /><span>{greetingName}.</span></h2>
          <p>
            Your people, projects and business performance.
            One connected workspace.
          </p>
          <div className="overview-hero-actions">
            <button type="button" className="dash-button hero-primary" onClick={() => onNavigate("ecosystem")}>Explore modules</button>
            <button
              type="button"
              className="dash-button secondary"
              onClick={() => onNavigate("reports")}
            >
              <IconChart />
              View business reports
            </button>
            <button
              type="button"
              className="dash-button"
              onClick={() => onNavigate("invoices")}
            >
              <IconInvoice />
              Review invoices
            </button>
          </div>
        </div>
        <BusinessScene role={session.role} onNavigate={onNavigate} />
        <aside className="overview-hero-aside" aria-label="Workspace status">
          <span>Today</span>
          <strong>{currentDate}</strong>
          <small>Every number below is loaded live from your workspace.</small>
          <div
            className={`overview-health${
              sessionCheck.state === "success" ? "" : " is-error"
            }`}
          >
            {sessionLabel}
          </div>
        </aside>
      </section>

      {dashboard.state === "loading" && (
        <StatusPanel
          variant="loading"
          title="Preparing your dashboard"
          description="Collecting live people, project, customer and finance data."
        />
      )}

      {dashboard.state === "error" && (
        <StatusPanel
          variant="error"
          title="Dashboard data is unavailable"
          description="The live overview could not be loaded. Check your connection and try again."
          actionLabel="Try again"
          onAction={retryDashboard}
        />
      )}

      {data && (
        <>
          {data.partial && (
            <div className="workspace-warning" role="status">
              Some dashboard sections could not be refreshed.{" "}
              <button
                type="button"
                className="dash-link-button"
                onClick={() => setDataRetry((count) => count + 1)}
              >
                Refresh dashboard
              </button>
            </div>
          )}

          {hasOverdue && (
            <div className="overview-alert-strip" role="status">
              <IconAlert />
              <p>
                <strong>{overdueTaskCount}</strong> overdue task
                {overdueTaskCount === 1 ? "" : "s"} and{" "}
                <strong>{overdueInvoiceCount}</strong> overdue invoice
                {overdueInvoiceCount === 1 ? "" : "s"} need attention.
              </p>
              <button
                type="button"
                className="dash-button secondary"
                onClick={() => onNavigate("tasks")}
              >
                Review tasks
              </button>
              <button
                type="button"
                className="dash-button secondary"
                onClick={() => onNavigate("invoices")}
              >
                Review invoices
              </button>
            </div>
          )}

          <div className="dash-primary-metrics">
            <StatCard
              label="Employees"
              value={employeeCount}
              icon={IconUsers}
              tone="sky"
              meta={`${metrics.totalClients ?? 0} clients in your workspace`}
            />
            <StatCard
              label="Projects"
              value={metrics.totalProjects ?? data.projectTotal ?? 0}
              icon={IconProjects}
              tone="blue"
              meta={`${metrics.activeProjects ?? 0} active · ${metrics.completedProjects ?? 0} completed`}
            />
            <StatCard
              label="Leads"
              value={metrics.totalLeads ?? data.leadTotal ?? 0}
              icon={IconFollowUp}
              tone="violet"
              meta={`${metrics.wonLeads ?? 0} won · ${metrics.openFollowUps ?? 0} open follow-ups`}
            />
            <StatCard
              label="Revenue"
              value={`₹ ${formatMoney(revenue)}`}
              icon={IconWallet}
              tone="green"
              meta={`${formatMoney(finance.totalOutstanding)} outstanding`}
            />
            <StatCard
              label="Expenses"
              value={`₹ ${formatMoney(expenses)}`}
              icon={IconExpense}
              tone="amber"
              meta={`${formatMoney(finance.pendingExpenseTotal)} awaiting approval`}
            />
            <StatCard
              label="Net profit"
              value={`₹ ${formatMoney(profit)}`}
              icon={IconChart}
              tone="green"
              meta={`${formatMoney(finance.totalCollected)} collected payments`}
            />
          </div>

          <div className="overview-grid">
            <RevenueExpenseChart monthly={finance.monthly || []} />
            <ProjectProgressCard
              projects={projects}
              tasks={tasks}
              onNavigate={onNavigate}
            />
          </div>

          <section className="overview-quick-section" aria-label="Quick actions">
            <div className="overview-quick-head">
              <div>
                <span className="overview-quick-kicker">
                  <IconSparkles />
                  Quick actions
                </span>
                <h3>Start your next move</h3>
                <p>Jump straight into the work that keeps the business moving.</p>
              </div>
            </div>
            <div className="overview-quick-grid">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    type="button"
                    className={`overview-quick tone-${action.tone}`}
                    key={action.id}
                    onClick={() => onNavigate(action.id, undefined, "create")}
                  >
                    <span className="overview-quick-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="overview-quick-copy">
                      <strong>{action.label}</strong>
                      <small>{action.description}</small>
                    </span>
                    <span className="overview-quick-plus" aria-hidden="true">
                      <IconPlus />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="overview-grid thirds">
            <ListCard
              title="Recent leads"
              description="Latest opportunities entering your pipeline."
              onViewAll={() => onNavigate("leads")}
              emptyTitle="No leads yet"
              emptyDescription="New leads will appear here as they are captured."
            >
              {recentLeads.length ? (
                <ul className="overview-list">
                  {recentLeads.map((lead) => (
                    <li key={lead.id}>
                      <span className="overview-list-icon">
                        <IconClients />
                      </span>
                      <div className="overview-list-copy">
                        <strong>{lead.name || "Unnamed lead"}</strong>
                        <span>
                          {lead.company || "No company"} ·{" "}
                          {lead.assignedTo?.fullName || "Unassigned"}
                        </span>
                      </div>
                      <div className="overview-list-meta">
                        <span className={statusClass(lead.status)}>
                          {formatStatus(lead.status)}
                        </span>
                        <span>
                          ₹ {formatMoney(lead.estimatedValue)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </ListCard>

            <ListCard
              title="Upcoming tasks"
              description="Work with the nearest due dates across every project."
              onViewAll={() => onNavigate("tasks")}
              emptyTitle="No upcoming tasks"
              emptyDescription="New assignments and due dates will appear here."
            >
              {upcomingTasks.length ? (
                <ul className="overview-list">
                  {upcomingTasks.map((task) => (
                    <li key={task.id}>
                      <span className="overview-list-icon">
                        <IconTasks />
                      </span>
                      <div className="overview-list-copy">
                        <strong>{task.title}</strong>
                        <span>
                          {task.projectName || "No project"} ·{" "}
                          {task.assignee?.fullName || "Unassigned"}
                        </span>
                      </div>
                      <div className="overview-list-meta">
                        <span className={`dash-priority-pill priority-${priorityTone(task.priority)}`}>
                          {formatStatus(task.priority)}
                        </span>
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </ListCard>

            <ListCard
              title="Pending leave"
              description="Requests waiting for an approval decision."
              onViewAll={() => onNavigate("leave")}
              emptyTitle="No pending leave"
              emptyDescription="New leave requests will appear here for review."
            >
              {pendingLeave.length ? (
                <ul className="overview-list">
                  {pendingLeave.map((item) => {
                    const values = item.values || {};
                    return (
                      <li key={item.id}>
                        <span className="overview-list-icon warning">
                          <IconCalendar />
                        </span>
                        <div className="overview-list-copy">
                          <strong>
                            {employeeNames.get(values.employeeId) ||
                              "Employee"}{" "}
                            · {formatStatus(values.type)}
                          </strong>
                          <span>
                            {formatDate(values.startDate)} –{" "}
                            {formatDate(values.endDate)}
                          </span>
                        </div>
                        <div className="overview-list-meta">
                          <span className="dash-status-pill status-submitted">
                            Pending
                          </span>
                          <span>{values.days ? `${values.days} days` : ""}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </ListCard>
          </div>

          <div className="overview-grid thirds">
            <ListCard
              title="Recent activity"
              description="The latest audited changes across the workspace."
              onViewAll={() => onNavigate("audit")}
              emptyTitle="No activity yet"
              emptyDescription="Audited changes will appear here as your team works."
            >
              {recentActivity.length ? (
                <ul className="overview-list">
                  {recentActivity.map((event) => (
                    <li key={event.id}>
                      <span className="overview-list-icon">
                        <IconClock />
                      </span>
                      <div className="overview-list-copy">
                        <strong>{actionLabel(event.action)}</strong>
                        <span>
                          {event.actor || "System"} · {resourceLabel(event.resource)}
                        </span>
                      </div>
                      <div className="overview-list-meta">
                        <strong>{relativeTime(event.createdAt)}</strong>
                        <span>{formatDateTime(event.createdAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </ListCard>

            <ListCard
              title="Overdue tasks"
              description="Work that is past its due date and still open."
              onViewAll={() => onNavigate("tasks")}
              emptyTitle="No overdue tasks"
              emptyDescription="Everything is on schedule right now."
            >
              {overdueTasks.length ? (
                <ul className="overview-list">
                  {overdueTasks.map((task) => (
                    <li key={task.id}>
                      <span className="overview-list-icon danger">
                        <IconAlert />
                      </span>
                      <div className="overview-list-copy">
                        <strong>{task.title}</strong>
                        <span>
                          {task.projectName || "No project"} ·{" "}
                          {task.assignee?.fullName || "Unassigned"}
                        </span>
                      </div>
                      <div className="overview-list-meta">
                        <span className="dash-status-pill status-overdue">
                          Overdue
                        </span>
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </ListCard>

            <ListCard
              title="Overdue invoices"
              description="Issued invoices with balances past their due date."
              onViewAll={() => onNavigate("invoices")}
              emptyTitle="No overdue invoices"
              emptyDescription="All issued invoices are within their payment terms."
            >
              {overdueInvoices.length ? (
                <ul className="overview-list">
                  {overdueInvoices.map((invoice) => (
                    <li key={invoice.id}>
                      <span className="overview-list-icon danger">
                        <IconInvoice />
                      </span>
                      <div className="overview-list-copy">
                        <strong>{invoice.invoiceNumber}</strong>
                        <span>
                          {invoice.clientName || invoice.clientCompany || "Client"}{" "}
                          · {formatDate(invoice.dueDate)}
                        </span>
                      </div>
                      <div className="overview-list-meta">
                        <span className="dash-status-pill status-overdue">
                          Overdue
                        </span>
                        <span>₹ {formatMoney(invoice.balanceDue)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </ListCard>
          </div>
        </>
      )}
    </div>
  );
}
