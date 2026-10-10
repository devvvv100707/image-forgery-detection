import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusPill } from "../components/StatusPill";
import { USE_MOCKS } from "../lib/config";
import { getHealth, type Health } from "../lib/api";

const links = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/analyze", label: "Image Analysis", icon: "image_search", end: false },
  { to: "/performance", label: "Model Performance", icon: "monitoring", end: false },
  { to: "/about", label: "About", icon: "info", end: false },
];

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [health, setHealth] = useState<Health | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        navigate("/analyze");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const connected = USE_MOCKS || Boolean(health?.connected);

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[auto_1fr]">
      <aside className={`flex flex-col bg-slate-900 text-slate-200 ${open ? "w-full md:w-[240px]" : "w-full md:w-[72px]"}`}>
        <div className="flex items-start justify-between gap-2 border-b border-slate-800 px-4 py-4">
          {open && (
            <div>
              <p className="text-[15px] font-semibold leading-5 text-white">AI Image Forgery Detection</p>
              <p className="text-[11px] uppercase tracking-[0.06em] text-slate-400">ELA + CNN Forensic Suite</p>
            </div>
          )}
          <button type="button" aria-label="Toggle navigation" onClick={() => setOpen((value) => !value)}>
            <Icon name="menu_open" />
          </button>
        </div>
        <p className={`px-4 pt-4 text-caption uppercase text-slate-500 ${open ? "" : "sr-only"}`}>Forensic Workstation</p>
        <nav className="mt-2 flex-1 px-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-control px-3 py-2 text-body-md ${isActive ? "bg-brand text-white" : "text-slate-300 hover:bg-slate-800"}`
              }
            >
              <Icon name={link.icon} />
              {open && link.label}
            </NavLink>
          ))}
        </nav>
        <div className="m-3 rounded-card border border-slate-800 bg-slate-800/60 p-3">
          <div className="flex items-center justify-between">
            {open && <p className="text-caption uppercase text-slate-400">Backend Service</p>}
            <StatusPill kind={connected ? "live" : "indeterminate"}>{connected ? "Live" : "Offline"}</StatusPill>
          </div>
          {open && (
            <>
              <p className="mt-2 text-body-sm text-slate-200">FastAPI: {connected ? "Connected :8000" : "Unreachable"}</p>
              <p className="text-body-sm text-slate-400">PyTorch / OpenCV Engine</p>
              {USE_MOCKS && <p className="mt-2 font-mono text-[11px] text-amber-300">Demo data flag on</p>}
            </>
          )}
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 md:px-6">
          <p className="text-body-sm text-slate-500">
            Forensic Lab Suite <span className="text-slate-300">/</span> <span className="text-slate-900">Workspace</span>
          </p>
          <div className="flex items-center gap-3">
            <span className="rounded-control border border-line bg-module px-2 py-1 font-mono text-[11px] tabular text-slate-600">
              Inference Endpoint 127.0.0.1:8000
            </span>
            <button type="button" aria-label="Notifications">
              <Icon name="notifications" />
            </button>
            <button type="button" className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white" aria-label="Profile">
              <Icon name="person" className="text-white" />
            </button>
          </div>
        </header>
        <main className="px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
