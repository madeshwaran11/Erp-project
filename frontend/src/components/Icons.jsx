// Lightweight inline SVG icons — no extra dependencies.

const baseProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function IconChart(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-5 3 3 5-7" />
    </svg>
  );
}

export function IconUsers(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3.2 3.2 0 0 1 0 6" />
      <path d="M17.5 13.6A5.5 5.5 0 0 1 20.5 19" />
    </svg>
  );
}

export function IconProjects(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M7.5 13.5l2 2 3.5-4" />
    </svg>
  );
}

export function IconTasks(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M7 9.5l1.6 1.6L12 8" />
      <path d="M14 9.5h4" />
      <path d="M7 16h4" />
      <path d="M14 16h4" />
    </svg>
  );
}

export function IconClients(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 20v-1.5A4.5 4.5 0 0 1 8.5 14h3A4.5 4.5 0 0 1 16 18.5V20" />
      <circle cx="10" cy="8" r="3.4" />
      <path d="M17 11h4M19 9v4" />
    </svg>
  );
}

export function IconLeads(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 5h18l-7 8v6l-4-2v-4z" />
    </svg>
  );
}

export function IconFollowUp(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </svg>
  );
}

export function IconFinance(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M7 10v4M17 10v4" />
    </svg>
  );
}

export function IconMarketing(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l7 4V5L7 9H5a1 1 0 0 0-1 1z" />
      <path d="M18 9a4 4 0 0 1 0 6" />
    </svg>
  );
}

export function IconReports(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9.5 17v-3M12 17v-5M14.5 17v-2" />
    </svg>
  );
}

export function IconSignOut(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h9" />
    </svg>
  );
}

export function IconMenu(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconRefresh(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 4v4h-4" />
    </svg>
  );
}

export function IconInbox(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 13l2-8h12l2 8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M4 13h4l1.5 2.5h5L16 13h4" />
    </svg>
  );
}

export function IconInvoice(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M7 8h10M7 12h6M7 16h4" />
    </svg>
  );
}

export function IconPayment(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M7 10v4M17 10v4" />
    </svg>
  );
}

export function IconExpense(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M7 15l2.6-2.6a1.5 1.5 0 0 1 2.1 0l1.4 1.4a1.5 1.5 0 0 0 2.1 0l2.8-2.8" />
      <circle cx="7" cy="9" r="1.4" />
    </svg>
  );
}

export function IconDownload(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 5v8M8 9l4 4 4-4M6 17h12" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconSearch(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function IconBell(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

export function IconSettings(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.12.38.34.72.64.99.3.27.69.42 1.1.42H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51.59z" />
    </svg>
  );
}

export function IconCommand(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M9 6.5A2.5 2.5 0 1 0 6.5 9H9zm0 0V9m0 0H6.5a2.5 2.5 0 1 0 2.5 2.5M9 9h6m0 0V6.5A2.5 2.5 0 1 1 17.5 9H15m0 0v6m0 0h2.5a2.5 2.5 0 1 1-2.5 2.5V15m0 0H9m0 0v2.5A2.5 2.5 0 1 1 6.5 15H9" />
    </svg>
  );
}

export function IconArrowUpRight(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function IconArrowRight(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconCalendar(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

export function IconClock(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </svg>
  );
}

export function IconWallet(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5z" />
      <path d="M4 8h15M16 12h3" />
    </svg>
  );
}

export function IconTrendUp(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m4 16 5-5 4 3 7-8" />
      <path d="M15 6h5v5" />
    </svg>
  );
}

export function IconBriefcase(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18M10 12v2h4v-2" />
    </svg>
  );
}

export function IconCheckCircle(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.3 2.3 4.7-5" />
    </svg>
  );
}

export function IconAlert(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 4 3 20h18z" />
      <path d="M12 9v5M12 17.5v.5" />
    </svg>
  );
}

export function IconProcurement(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      <path d="m8 5.3 8 4.5" />
    </svg>
  );
}

export function IconAssets(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2.2" />
      <path d="M8 20h8M12 16v4M7 8h4M7 11h7" />
    </svg>
  );
}

export function IconTraining(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m3 9 9-4 9 4-9 4z" />
      <path d="M7 11.5V16c0 1.7 2.2 3 5 3s5-1.3 5-3v-4.5" />
      <path d="M21 9v5" />
    </svg>
  );
}

export function IconAdmin(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 3 5 6v5.5c0 4.2 2.8 7.9 7 9.5 4.2-1.6 7-5.3 7-9.5V6z" />
      <path d="m9.3 12 1.8 1.8 3.6-3.8" />
    </svg>
  );
}

export function IconSparkles(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4z" />
      <path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8zM5 3.5l.6 1.7 1.7.6-1.7.6L5 8.1l-.6-1.7-1.7-.6 1.7-.6z" />
    </svg>
  );
}

export function IconSpark(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m13 2-8 12h6l-1 8 8-12h-6z" />
    </svg>
  );
}
