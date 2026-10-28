// Glass-styled summary card used across the dashboard.
export default function StatCard({
  label,
  value,
  meta,
  trend,
  icon: Icon,
  tone = "blue",
  badge,
}) {
  return (
    <article className={`dash-card dash-stat tone-${tone}`}>
      <div className="dash-stat-top">
        <span
          className={`dash-stat-icon${Icon ? "" : " dash-stat-icon-empty"}`}
          aria-hidden="true"
        >
          {Icon ? <Icon /> : <span className="dash-stat-icon-core" />}
        </span>
        {badge}
      </div>

      <div className="dash-stat-copy">
        <span className="dash-stat-label">{label}</span>
        <strong className="dash-stat-value">{value}</strong>
      </div>

      {meta && (
        <span className={`dash-stat-meta trend-${trend || "flat"}`}>{meta}</span>
      )}
    </article>
  );
}
