import { navigationForRole } from "../nav";
import { PageHeading } from "../components/WorkspaceUI";
import { homePathForRole } from "../roles";
import { Link } from "react-router-dom";

const workflow = [
  ["marketing", "Campaign"], ["leads", "Lead"], ["clients", "Customer"], ["projects", "Project"],
  ["people", "Employee"], ["tasks", "Task"], ["invoices", "Invoice"], ["overview", "Dashboard"],
];
export default function EcosystemPage({ session }) {
  const nav = navigationForRole(session.role);
  const groups = nav.filter((item, index) => !["overview","ecosystem"].includes(item.id) && nav.findIndex((entry) => entry.group === item.group) === index);
  const base = homePathForRole(session.role);
  const allowed = new Set(nav.map((i) => i.id));
  return <div className="dash-page ecosystem-page">
    <PageHeading title="ERP Ecosystem" description="One connected platform for your people, customers and operations." />
    <section className="ecosystem-map" aria-label="Connected ERP modules">
      <div className="ecosystem-rings" aria-hidden="true"><i /><i /><i /></div>
      <div className="ecosystem-core editorial-core" aria-hidden="true"><img src="/artwork/erp-core.webp" alt="" width="720" height="720" /><span>PriyoniX ERP</span></div>
      <div className="ecosystem-modules">
        {groups.map((item) => {
          const Icon = item.icon;
          const count = nav.filter((n) => n.group === item.group).length;
          return <Link key={item.group} className={`ecosystem-module eco-${item.group}`} to={`${base}?section=${item.id}`}><span className="eco-icon"><Icon /></span><strong>{item.employeeGroupLabel && session.role !== "ADMIN" ? item.employeeGroupLabel : item.groupLabel}</strong><span>{count} connected {count === 1 ? "section" : "sections"}</span></Link>;
        })}
      </div>
    </section>
    <section className="dash-card ecosystem-flow"><h3>Your connected business workflow</h3><p>Open each workspace to manage the records behind your operations.</p>
      <ol>{workflow.filter(([id]) => allowed.has(id)).map(([id,label],i) => <li key={id}><Link to={`${base}?section=${id}`}><span>{String(i+1).padStart(2,"0")}</span>{label}</Link></li>)}</ol>
    </section>
  </div>;
}
