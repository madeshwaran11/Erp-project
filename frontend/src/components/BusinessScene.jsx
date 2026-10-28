import { useState } from "react";
import HumanArtwork from "./HumanArtwork";
import { IconUsers, IconClients, IconProjects, IconFinance, IconMarketing, IconReports } from "./Icons";
import { navigationForRole } from "../nav";
import { permittedModules } from "./scenePolicy";

const cards = [
  { id: "people", label: "HR & Employees", icon: IconUsers },
  { id: "leads", label: "CRM & Leads", icon: IconClients },
  { id: "projects", label: "Projects & Tasks", icon: IconProjects },
  { id: "invoices", label: "Finance", icon: IconFinance },
  { id: "marketing", label: "Marketing", icon: IconMarketing },
  { id: "reports", label: "Reports", icon: IconReports },
];
export default function BusinessScene({ role, onNavigate, decorative = false }) {
  const [paused, setPaused] = useState(false);
  const modules = decorative ? cards.slice(0, 4) : permittedModules(cards, navigationForRole(role));
  return <div className={`business-scene editorial-scene ${decorative ? "auth-business-scene" : ""}`} data-effects={paused ? "paused" : "active"}>
    <HumanArtwork variant={decorative ? "man" : "woman"} />
    <div className="floating-modules">
      {modules.map(({id,label,icon:Icon},index) => decorative
        ? <span className={`floating-module module-${index}`} key={id}><Icon /><span>{label}</span></span>
        : <button type="button" className={`floating-module module-${index}`} key={id} onClick={() => onNavigate(id)}><Icon /><span>{label}</span></button>)}
    </div>
    <button type="button" className="artwork-motion-toggle" aria-label={paused ? "Resume visual effects" : "Pause visual effects"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Resume effects" : "Pause effects"}</button>
  </div>;
}
