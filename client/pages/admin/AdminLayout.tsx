import { Link, Outlet, useLocation } from "react-router-dom";
import { useSiteConfig } from "@/state/site-config";

function NavItem({ to, label }: { to: string; label: string }) {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-md text-sm ${active ? "bg-neutral-200" : "hover:bg-neutral-100"}`}
    >
      {label}
    </Link>
  );
}

export default function AdminLayout() {
  const { state } = useSiteConfig();
  return (
    <div className="min-h-[calc(100vh-70px)] grid grid-cols-[240px_1fr]">
      <aside className="border-r bg-white p-4 space-y-2">
        <div className="font-bold mb-4 text-neutral-800">Admin Dashboard</div>
        <nav className="space-y-1">
          <NavItem to="/admin" label="Dashboard" />
          <NavItem to="/admin/slider" label="Slide Pic" />
          <NavItem to="/admin/boxes" label="Boxes" />
          <NavItem to="/admin/logos" label="Logos" />
          <NavItem to="/admin/contact" label="Contact Form" />
          <NavItem to="/admin/header" label="Header" />
          <NavItem to="/admin/footer" label="Footer" />
          <NavItem to="/admin/colors" label="Colors" />
          <NavItem to="/admin/settings" label="Settings" />
        </nav>
      </aside>
      <main className="p-6 bg-neutral-50">
        <div className="mb-4 text-sm text-neutral-600">
          Editing site:{" "}
          <span className="font-semibold">{state.header.logoText}</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
