import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconArrowRight,
  IconBell,
  IconMenu,
  IconSearch,
  IconSettings,
  IconSignOut,
} from "./Icons";
import { Modal, DataState, Notice } from "./WorkspaceUI";
import { request, useRemote, humanize } from "../workspaceApi";
import { canonicalRole, roleLabel } from "../roles";

function initialsFor(email) {
  return (email || "U")
    .split("@")[0]
    .split(/[._+\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function SearchDialog({ onClose, onNavigate }) {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const { data, error, loading, reload } = useRemote(
    query ? `/api/platform/search?q=${encodeURIComponent(query)}` : null
  );

  return (
    <Modal title="Search your workspace" onClose={onClose}>
      <form
        className="workspace-global-search"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(input.trim());
        }}
      >
        <label className="sr-only" htmlFor="global-search">
          Search all records
        </label>
        <input
          id="global-search"
          autoFocus
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search clients, projects, people and more…"
          minLength={2}
          required
        />
        <button className="dash-button">
          <IconSearch />
          Search
        </button>
      </form>
      {query ? (
        <DataState loading={loading} error={error} retry={reload}>
          <div className="workspace-search-results">
            {data?.length ? (
              data.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => {
                    onNavigate(result.section, result.id);
                    onClose();
                  }}
                >
                  <span>
                    <strong>{result.label}</strong>
                    <small>
                      {humanize(result.type)} · Record {result.id}
                    </small>
                  </span>
                  <IconArrowRight />
                </button>
              ))
            ) : (
              <p>No matching records for “{query}”.</p>
            )}
          </div>
        </DataState>
      ) : (
        <p className="workspace-help">
          Enter at least two characters to find saved records across your
          permitted modules.
        </p>
      )}
    </Modal>
  );
}

function NotificationDialog({ onClose, onChanged }) {
  const { data, loading, error, reload } =
    useRemote("/api/platform/notifications");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(null);

  async function markRead(item) {
    setBusy(item.id);
    setActionError("");
    try {
      await request(`/api/platform/notifications/${item.id}/read`, {
        method: "PATCH",
      });
      reload();
      onChanged?.();
    } catch (failure) {
      setActionError(failure.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal title="Notifications" onClose={onClose} wide={false}>
      <Notice error>{actionError}</Notice>
      <DataState loading={loading} error={error} retry={reload}>
        {data?.length ? (
          <ul className="workspace-notifications">
            {data.map((item) => (
              <li key={item.id} className={item.read ? "read" : "unread"}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </div>
                {!item.read && (
                  <button
                    className="dash-button secondary compact"
                    disabled={busy === item.id}
                    onClick={() => markRead(item)}
                  >
                    {busy === item.id ? "Saving…" : "Mark read"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="workspace-state">
            <strong>You’re all caught up</strong>
            <p>Updates and activity notifications will appear here.</p>
          </div>
        )}
      </DataState>
    </Modal>
  );
}

function SettingsDialog({ session, onClose, onNavigate, onSignOut }) {
  const isAdmin = canonicalRole(session.role) === "ADMIN";

  return (
    <Modal title="Account settings" onClose={onClose} wide={false}>
      <div className="settings-profile">
        <span className="dash-avatar" aria-hidden="true">
          {initialsFor(session.email)}
        </span>
        <div>
          <strong>{session.email}</strong>
          <span>{roleLabel(session.role)} account</span>
        </div>
      </div>
      <dl className="settings-list">
        <div>
          <dt>Email address</dt>
          <dd>{session.email}</dd>
        </div>
        <div>
          <dt>Workspace role</dt>
          <dd>{roleLabel(session.role)}</dd>
        </div>
        <div>
          <dt>Session security</dt>
          <dd>JWT protected</dd>
        </div>
      </dl>
      <p className="settings-note">
        Your account details are managed by your workspace administrator.
        Contact them if your role or work email needs to change.
      </p>
      <div className="dash-form-actions">
        {isAdmin && (
          <button
            type="button"
            className="dash-button secondary"
            onClick={() => {
              onNavigate("organization");
              onClose();
            }}
          >
            <IconSettings />
            Organization settings
          </button>
        )}
        <button type="button" className="dash-button danger" onClick={onSignOut}>
          <IconSignOut />
          Sign out
        </button>
      </div>
    </Modal>
  );
}

export default function Header({
  activeItem,
  session,
  sidebarOpen,
  onToggleSidebar,
  onSignOut,
  onNavigate,
  panel,
  onOpenPanel,
  onClosePanel,
}) {
  const [localPanel, setLocalPanel] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const activePanel = panel === undefined ? localPanel : panel;
  const initials = initialsFor(session.email);
  const displayName = session.email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const notifications = useRemote("/api/platform/notifications");
  const unreadCount = useMemo(
    () =>
      Array.isArray(notifications.data)
        ? notifications.data.filter((item) => !item.read).length
        : 0,
    [notifications.data]
  );

  function openPanel(nextPanel) {
    setProfileOpen(false);
    if (onOpenPanel) onOpenPanel(nextPanel);
    else setLocalPanel(nextPanel);
  }

  function closePanel() {
    if (onClosePanel) onClosePanel();
    else setLocalPanel(null);
  }

  useEffect(() => {
    function handleShortcut(event) {
      if (
        (event.metaKey || event.ctrlKey) &&
        String(event.key).toLowerCase() === "k"
      ) {
        event.preventDefault();
        setProfileOpen(false);
        if (onOpenPanel) onOpenPanel("search");
        else setLocalPanel("search");
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [onOpenPanel]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    function handlePointerDown(event) {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    }
    function handleKey(event) {
      if (event.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [profileOpen]);

  return (
    <>
      <header className="dash-header">
        <button
          type="button"
          className="dash-menu-button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
          aria-controls="workspace-sidebar"
          aria-expanded={sidebarOpen}
        >
          <IconMenu />
        </button>
        <div className="dash-header-title">
          <span className="dash-header-eyebrow">
            <span>Workspace</span>
            <span className="dash-crumb-separator" aria-hidden="true">
              /
            </span>
            <span>{activeItem.groupLabel}</span>
          </span>
          <h1>{activeItem.label}</h1>
        </div>
        <div className="dash-header-actions">
          <span className="dash-header-live">
            <span className="dash-header-live-dot" aria-hidden="true" />
            Live workspace
          </span>
          <button
            className="workspace-search-trigger"
            onClick={() => openPanel("search")}
            aria-label="Search workspace"
          >
            <IconSearch />
            <span>Search workspace</span>
            <kbd>Ctrl K</kbd>
          </button>
          <button
            className="dash-icon-button notification-trigger"
            title="Notifications"
            aria-label={
              unreadCount
                ? `Open notifications, ${unreadCount} unread`
                : "Open notifications"
            }
            onClick={() => openPanel("notifications")}
          >
            <IconBell />
            {unreadCount > 0 && (
              <span className="notification-count" aria-hidden="true">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <div className="dash-profile" ref={profileRef}>
            <button
              type="button"
              className="dash-profile-button"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span className="dash-avatar" aria-hidden="true">
                {initials}
              </span>
              <span className="dash-user-meta">
                <strong>{displayName}</strong>
                <span>{roleLabel(session.role)}</span>
              </span>
              <svg
                className="dash-profile-caret"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {profileOpen && (
              <div className="dash-profile-menu" role="menu">
                <div className="dash-profile-menu-head">
                  <span className="dash-avatar small" aria-hidden="true">
                    {initials}
                  </span>
                  <span>
                    <strong>{session.email}</strong>
                    <small>{roleLabel(session.role)}</small>
                  </span>
                </div>
                <button
                  type="button"
                  className="dash-menu-action"
                  role="menuitem"
                  onClick={() => openPanel("settings")}
                >
                  <IconSettings />
                  Account settings
                </button>
                <button
                  type="button"
                  className="dash-menu-action danger"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    onSignOut();
                  }}
                >
                  <IconSignOut />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {activePanel === "search" && (
        <SearchDialog onClose={closePanel} onNavigate={onNavigate} />
      )}
      {activePanel === "notifications" && (
        <NotificationDialog
          onClose={closePanel}
          onChanged={notifications.reload}
        />
      )}
      {activePanel === "settings" && (
        <SettingsDialog
          session={session}
          onClose={closePanel}
          onNavigate={onNavigate}
          onSignOut={onSignOut}
        />
      )}
    </>
  );
}
