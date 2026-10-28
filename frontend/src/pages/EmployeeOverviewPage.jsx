import BusinessScene from "../components/BusinessScene";
import { useRemote } from "../workspaceApi";
import { DataState } from "../components/WorkspaceUI";
import StatCard from "../components/StatCard";
import {
  IconCalendar,
  IconClock,
  IconFollowUp,
  IconTasks,
} from "../components/Icons";

const actions = [
  ["tasks", "My tasks", "See everything assigned to you.", IconTasks],
  ["follow-ups", "Follow-ups", "Keep customer conversations moving.", IconFollowUp],
  ["timesheets", "Log time", "Record time against your projects.", IconClock],
  ["attendance", "Attendance", "Review your daily attendance.", IconCalendar],
  ["leave", "Request leave", "Plan time away and track approvals.", IconCalendar],
];

export default function EmployeeOverviewPage({ session, onNavigate }) {
  const { data, loading, error, reload } = useRemote("/api/employee/overview");
  const name = data?.profile?.fullName || session.email.split("@")[0];

  return (
    <div className="dash-page overview-page">
      <section className="overview-hero">
        <div className="overview-hero-copy">
          <h2>Welcome back,<br /><span>{name}.</span></h2>
          <p>
            Your assigned work, time and requests are gathered here so you can
            pick up exactly where you left off.
          </p>
          <div className="overview-hero-actions">
            <button
              type="button"
              className="dash-button secondary"
              onClick={() => onNavigate("tasks")}
            >
              <IconTasks />
              Open my tasks
            </button>
            <button
              type="button"
              className="dash-button"
              onClick={() => onNavigate("leave")}
            >
              <IconCalendar />
              Request leave
            </button>
          </div>
        </div>
        <BusinessScene role={session.role} onNavigate={onNavigate} />
        <aside className="overview-hero-aside" aria-label="Your profile">
          <span>Your profile</span>
          <strong>{data?.profile?.designation || "Team member"}</strong>
          <small>
            {data?.profile?.department || "Workspace team"}
            {data?.profile?.employmentStatus
              ? ` · ${data.profile.employmentStatus}`
              : ""}
          </small>
          <div className="overview-health">
            {data?.profile?.employeeId
              ? "Employee record linked"
              : "Record not linked yet"}
          </div>
        </aside>
      </section>

      <DataState loading={loading} error={error} retry={reload}>
        {data && (
          <>
            <div className="dash-stat-grid">
              <StatCard
                label="Assigned tasks"
                value={data.metrics.assignedTasks}
                icon={IconTasks}
                tone="blue"
                meta="Across your projects"
              />
              <StatCard
                label="Open tasks"
                value={data.metrics.openTasks}
                icon={IconClock}
                tone="amber"
                meta="Still in progress"
              />
              <StatCard
                label="Assigned follow-ups"
                value={data.metrics.assignedFollowUps}
                icon={IconFollowUp}
                tone="violet"
                meta="Customer conversations"
              />
              <StatCard
                label="Open follow-ups"
                value={data.metrics.openFollowUps}
                icon={IconCalendar}
                tone="sky"
                meta="Waiting for your update"
              />
            </div>

            <section className="workspace-panel">
              <div>
                <h2>Continue your work</h2>
                <p className="workspace-help">
                  Jump straight into the areas that need your attention.
                </p>
              </div>
              <div className="employee-action-grid">
                {actions.map(([key, label, description, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    className="employee-action"
                    onClick={() => onNavigate(key)}
                  >
                    <span className="overview-list-icon">
                      <Icon />
                    </span>
                    <span>
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {!data.profile.employeeId && (
              <p className="workspace-warning">
                An administrator can link your employee record using your work
                email to enable attendance, leave and timesheets.
              </p>
            )}
          </>
        )}
      </DataState>
    </div>
  );
}
