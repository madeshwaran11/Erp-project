import { useEffect, useRef } from "react";
import { IconBell, IconClose, IconSettings } from "./Icons";
import Brand from "./Brand";
import { canonicalRole, roleLabel } from "../roles";

const NAV_CLUSTERS = [
  { key: "overview", label: "Command centre", groups: ["overview"] },
  { key: "people", label: "People & customers", groups: ["people", "crm"] },
  {
    key: "operations",
    label: "Delivery & operations",
    groups: ["delivery", "finance", "procurement", "assets"],
  },
  {
    key: "growth",
    label: "Growth & insight",
    groups: ["training", "marketing", "reports"],
  },
  { key: "governance", label: "Governance", groups: ["administration"] },
];

function initialsFor(email) {
  return (email || "U")
    .split("@")[0]
    .split(/[._+\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Sidebar({
  activeId,
  isOpen,
  drawerMode,
  navigation,
  onClose,
  onSelect,
  onOpenPanel,
  session,
}) {
  const drawer = useRef(null);
  const groups = new Map();
  for (const item of navigation) {
    if (!groups.has(item.group)) groups.set(item.group, item);
  }
  const activeGroup = navigation.find((item) => item.id === activeId)?.group;
  const isAdmin = canonicalRole(session.role) === "ADMIN";
  const accountName = session.email.split("@")[0].replace(/[._-]+/g, " ");

  useEffect(() => {
    // A drawer traps focus and locks page scrolling. The expanded desktop
    // sidebar is part of the page, so it must not change body overflow or
    // steal focus from the active module.
    if (!isOpen || !drawerMode) return undefined;
    const node = drawer.current;
    if (!node) return undefined;
    const previous = document.activeElement;
    const visibleButtons = () =>
      [...node.querySelectorAll("button:not(:disabled)")].filter(
        (button) => button.getClientRects().length > 0
      );
    visibleButtons()[0]?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const elements = visibleButtons();
        const first = elements[0];
        const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, [drawerMode, isOpen, onClose]);

  function openPanel(panel) {
    onOpenPanel?.(panel);
  }

  return (
    <>
      {isOpen && drawerMode && (
        <button
          type="button"
          className="dash-sidebar-backdrop"
          onClick={onClose}
          tabIndex={-1}
          aria-label="Close navigation"
        />
      )}
      <aside
        ref={drawer}
        id="workspace-sidebar"
        className={`dash-sidebar${isOpen ? " is-open" : ""}`}
        aria-label="Workspace navigation"
        role={isOpen && drawerMode ? "dialog" : undefined}
        aria-modal={isOpen && drawerMode ? "true" : undefined}
      >
        <div className="dash-brand">
          <Brand compact />
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close navigation"
            aria-controls="workspace-sidebar"
            onClick={onClose}
          >
            <IconClose />
          </button>
        </div>

        <div className="sidebar-workspace-badge">
          <span className="sidebar-workspace-dot" aria-hidden="true" />
          <span>Integrated business workspace</span>
        </div>

        <nav className="dash-nav" aria-label="Dashboard sections">
          {NAV_CLUSTERS.map((cluster) => {
            const clusterGroups = cluster.groups
              .map((key) => groups.get(key))
              .filter(Boolean);
            if (!clusterGroups.length) return null;
            return (
              <div className="dash-nav-cluster" key={cluster.key}>
                <span className="dash-nav-label">{cluster.label}</span>
                {clusterGroups.map((item) => {
                  const Icon = item.icon;
                  const active = item.group === activeGroup;
                  return (
                    <button
                      key={item.group}
                      className={`dash-nav-item${active ? " is-active" : ""}`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => onSelect(item.id)}
                    >
                      <span className="dash-nav-icon" aria-hidden="true">
                        <Icon />
                      </span>
                      <span className="dash-nav-copy">
                        {!isAdmin && item.employeeGroupLabel
                          ? item.employeeGroupLabel
                          : item.groupLabel}
                      </span>
                      {active && <span className="nav-active-indicator" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="dash-nav-utility">
          <span className="dash-nav-label">Workspace tools</span>
          <button
            type="button"
            className="dash-nav-item"
            onClick={() => openPanel("notifications")}
          >
            <span className="dash-nav-icon" aria-hidden="true">
              <IconBell />
            </span>
            <span className="dash-nav-copy">Notifications</span>
          </button>
          <button
            type="button"
            className="dash-nav-item"
            onClick={() => openPanel("settings")}
          >
            <span className="dash-nav-icon" aria-hidden="true">
              <IconSettings />
            </span>
            <span className="dash-nav-copy">Settings</span>
          </button>
        </div>

        <div className="dash-sidebar-footer">
          <div className="sidebar-account-card">
            <span className="dash-avatar small sidebar-account-avatar" aria-hidden="true">
              {initialsFor(session.email)}
            </span>
            <div className="sidebar-account-copy">
              <strong>{roleLabel(session.role)}</strong>
              <span>{accountName}</span>
            </div>
            <span className="sidebar-account-status" aria-label="Online" />
          </div>
          <p>{session.email}</p>
          <span className="sidebar-account-note">
            Your connected business, in one place.
          </span>
        </div>
      </aside>
    </>
  );
}
